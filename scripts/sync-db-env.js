#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const YAML = require('yaml');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, 'travel-ops-oups', '.env');
const HOST = '127.0.0.1';
const DEFAULT_PORT = '5432';
const TARGET_CONTAINER_PORT = '5432';

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
}

function writeEnvFile(filePath, lines) {
  const content = lines.join(os.EOL);
  const normalized = content.endsWith(os.EOL) ? content : content + os.EOL;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, normalized, 'utf8');
}

function updateDatabaseUrlLine(lines, urlLine) {
  let replaced = false;
  const updated = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return line;
    }
    if (trimmed.toUpperCase().startsWith('DATABASE_URL=')) {
      replaced = true;
      return urlLine;
    }
    return line;
  });

  if (!replaced) {
    if (updated.length && updated[updated.length - 1].trim() !== '') {
      updated.push('');
    }
    updated.push(urlLine);
  }

  return updated;
}

function maskPassword(password) {
  if (!password) {
    return '<not set>';
  }
  return password.replace(/./g, '*');
}

function parseComposeFile() {
  const candidate = ['docker-compose.yml', 'docker-compose.yaml']
    .map((name) => path.join(ROOT, name))
    .find((file) => fs.existsSync(file));

  if (!candidate) {
    return null;
  }

  const content = fs.readFileSync(candidate, 'utf8');
  const doc = YAML.parse(content);
  if (!doc || !doc.services) {
    return null;
  }

  const services = doc.services || {};
  const normalizedServices = Object.entries(services);

  const targetService =
    normalizedServices.find(([name, service]) => {
      if (!service) {
        return false;
      }
      const identifiers = [
        service.image,
        service.container_name,
        name,
        service.build?.context,
        service.build?.dockerfile,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return identifiers.some((value) => value.includes('postgres'));
    }) || normalizedServices[0];

  if (!targetService) {
    return null;
  }

  const [, serviceConfig] = targetService;
  return {
    filePath: candidate,
    env: serviceConfig?.environment || serviceConfig?.env || {},
    envFiles: serviceConfig?.env_file || serviceConfig?.envFile || [],
    ports: serviceConfig?.ports || [],
  };
}

function normalizeEnvironment(raw) {
  if (!raw) {
    return {};
  }

  if (Array.isArray(raw)) {
    return raw.reduce((acc, entry) => {
      const [key, ...valueParts] = String(entry).split('=');
      if (!key) {
        return acc;
      }
      acc[key.trim()] = valueParts.join('=').trim();
      return acc;
    }, {});
  }

  if (typeof raw === 'object') {
    return Object.entries(raw).reduce((acc, [key, value]) => {
      if (!key) {
        return acc;
      }
      acc[key.trim()] =
        typeof value === 'string' ? value.trim() : String(value).trim();
      return acc;
    }, {});
  }

  return {};
}

function readEnvFiles(basePath, files) {
  const accum = {};
  const entries = Array.isArray(files) ? files : [files];
  entries
    .filter(Boolean)
    .map((file) => path.resolve(path.dirname(basePath), file))
    .forEach((filePath) => {
      if (!fs.existsSync(filePath)) {
        return;
      }
      readEnvFile(filePath).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          return;
        }
        const [key, ...values] = trimmed.split('=');
        if (!key) {
          return;
        }
        accum[key.trim()] = values.join('=').trim();
      });
    });
  return accum;
}

function extractHostPort(spec) {
  if (!spec) {
    return null;
  }

  const arrowMatch = spec.match(/^(?:\[([^\]]+)\]|([^:]+))?:(\d+)->(\d+)\/tcp$/);
  if (arrowMatch) {
    return arrowMatch[3];
  }

  const simpleMatch = spec.match(/^(?:\[([^\]]+)\]|([^:]+))?:(\d+)$/);
  if (simpleMatch) {
    return simpleMatch[3];
  }

  const fallbackMatch = spec.match(/^(\d+)$/);
  if (fallbackMatch) {
    return fallbackMatch[1];
  }

  return null;
}

function extractComposePort(ports) {
  const entries = Array.isArray(ports) ? ports : [ports];
  for (const entry of entries) {
    if (!entry) {
      continue;
    }
    const value = String(entry).trim();
    if (value.includes('->')) {
      const candidate = extractHostPort(value);
      if (candidate) {
        return candidate;
      }
      continue;
    }

    const parts = value.split(':').map((part) => part.trim());
    if (parts.length === 1 && /^\d+$/.test(parts[0])) {
      return parts[0];
    }
    if (parts.length === 2 && parts.every((part) => /^\d+$/.test(part))) {
      return parts[0];
    }
    if (parts.length === 3 && /^\d+$/.test(parts[1])) {
      return parts[1];
    }
  }
  return null;
}

function parseContainerPortEntry(entry) {
  if (!entry) {
    return null;
  }

  const arrowMatch = entry.match(/^(?:\[([^\]]+)\]|([^:]+))?:(\d+)->(\d+)\/tcp$/);
  if (arrowMatch) {
    return {
      hostPort: arrowMatch[3],
      containerPort: arrowMatch[4],
    };
  }

  const simpleMatch = entry.match(/^(?:\[([^\]]+)\]|([^:]+))?:(\d+)$/);
  if (simpleMatch) {
    return {
      hostPort: simpleMatch[3],
      containerPort: null,
    };
  }

  return null;
}

function getContainerHostPort(ports, targetPort) {
  if (!ports) {
    return null;
  }

  const entries = ports.split(',').map((segment) => segment.trim());
  for (const entry of entries) {
    const parsed = parseContainerPortEntry(entry);
    if (!parsed) {
      continue;
    }
    if (parsed.containerPort === targetPort || parsed.containerPort === null) {
      return parsed.hostPort;
    }
  }

  return null;
}

function runDockerPs() {
  const result = spawnSync('docker', ['ps', '--format', '{{.ID}}\t{{.Image}}\t{{.Names}}\t{{.Ports}}'], {
    encoding: 'utf8',
  });

  if (result.error || result.status !== 0) {
    exitWithError(
      'Unable to run `docker ps`. Make sure Docker is running and available on your PATH.'
    );
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, image, name, ports = ''] = line.split('\t');
      return { id, image, name, ports };
    });
}

function pickPostgresContainer(containers) {
  const match = containers.find(
    (container) =>
      (container.image && container.image.toLowerCase().includes('postgres')) ||
      (container.name && container.name.toLowerCase().includes('postgres'))
  );
  if (match) {
    return match;
  }
  return containers[0];
}

function readContainerEnv(containerId) {
  const result = spawnSync('docker', ['exec', containerId, 'printenv'], { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    exitWithError(`Failed to read environment from container ${containerId}.`);
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((entry) => entry.split('='))
    .reduce((acc, [key, ...rest]) => {
      if (!key) {
        return acc;
      }
      acc[key] = rest.join('=');
      return acc;
    }, {});
}

function main() {
  const composeInfo = parseComposeFile();
  const composeEnv = composeInfo ? normalizeEnvironment(composeInfo.env) : {};
  if (composeInfo?.envFiles) {
    Object.assign(composeEnv, readEnvFiles(composeInfo.filePath, composeInfo.envFiles));
  }

  let containers = [];
  let container = null;
  let containerEnv = {};
  let containerPort = null;

  const needsDocker =
    !composeInfo ||
    !composeEnv.POSTGRES_USER ||
    !composeEnv.POSTGRES_PASSWORD ||
    !composeEnv.POSTGRES_DB;

  if (needsDocker) {
    containers = runDockerPs();
    if (containers.length === 0) {
      exitWithError('No Docker containers are running. Start Postgres first.');
    }

    container = pickPostgresContainer(containers);
    if (!container) {
      exitWithError('No Postgres-based Docker container was detected.');
    }

    containerEnv = readContainerEnv(container.id);
    containerPort = getContainerHostPort(container.ports, TARGET_CONTAINER_PORT);
  }

  const user =
    composeEnv.POSTGRES_USER ||
    containerEnv.POSTGRES_USER ||
    exitWithError('POSTGRES_USER was not found in Docker metadata.');
  const password =
    composeEnv.POSTGRES_PASSWORD ||
    containerEnv.POSTGRES_PASSWORD ||
    exitWithError('POSTGRES_PASSWORD was not found in Docker metadata.');
  const database =
    composeEnv.POSTGRES_DB ||
    containerEnv.POSTGRES_DB ||
    exitWithError('POSTGRES_DB was not found in Docker metadata.');

  const composePort = composeInfo ? extractComposePort(composeInfo.ports) : null;

  let port = DEFAULT_PORT;
  let portSource = 'default 5432';
  if (composePort) {
    port = composePort;
    portSource = composeInfo ? `compose (${path.basename(composeInfo.filePath)})` : 'compose';
  } else if (containerPort) {
    port = containerPort;
    portSource = container ? `container ${container.name || container.id}` : 'container';
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const encodedDatabase = encodeURIComponent(database);
  const url = `postgresql://${encodedUser}:${encodedPassword}@${HOST}:${port}/${encodedDatabase}?schema=public`;
  const urlLine = `DATABASE_URL="${url}"`;

  const existingLines = readEnvFile(ENV_PATH);
  const updatedLines = updateDatabaseUrlLine(existingLines, urlLine);
  writeEnvFile(ENV_PATH, updatedLines);

  console.log(
    `Updated DATABASE_URL for user ${user} db ${database} port ${port} (source: ${portSource}, password hidden).`
  );
}

main();
