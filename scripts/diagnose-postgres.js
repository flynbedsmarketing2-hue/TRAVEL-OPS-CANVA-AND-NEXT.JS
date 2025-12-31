#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const ROOT = path.resolve(__dirname, '..');
const COMPOSE_FILES = ['docker-compose.yml', 'docker-compose.yaml'];

function runCommand(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' });
}

function printSection(title) {
  console.log('\n== ' + title + ' ==');
}

function diagnosePort() {
  printSection('Port 5432 listeners (netstat)');
  const result = runCommand('cmd', ['/C', 'netstat -ano']);
  if (result.error) {
    console.error('Unable to run netstat:', result.error.message);
    return;
  }

  const lines = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes(':5432'));

  if (!lines.length) {
    console.log('No process is listening on port 5432.');
    return;
  }

  const pids = new Set();
  lines.forEach((line) => {
    console.log('  ' + line);
    const parts = line.split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid) {
      pids.add(pid);
    }
  });

  pids.forEach((pid) => {
    const tasklist = runCommand('tasklist', ['/FI', `PID eq ${pid}`]);
    if (tasklist.error) {
      console.error(`  Unable to inspect PID ${pid}:`, tasklist.error.message);
      return;
    }
    const filtered = tasklist.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(1);
    console.log(`  Process details for PID ${pid}:`);
    filtered.forEach((line) => console.log('    ' + line));
  });
}

function parseDockerPorts(ports) {
  const arrowRegex = /(?:(?:\[.*?\]|[^:]+):)?(\d+)->(\d+)\/tcp/;
  if (!ports) {
    return [];
  }
  return ports
    .split(',')
    .map((segment) => segment.trim())
    .map((segment) => {
      const match = arrowRegex.exec(segment);
      if (match) {
        return {
          original: segment,
          hostPort: match[1],
          containerPort: match[2],
        };
      }
      return {
        original: segment,
      };
    });
}

function diagnoseDocker() {
  printSection('Docker Postgres containers');
  const dockerResult = runCommand('docker', [
    'ps',
    '--format',
    '{{.ID}}\t{{.Image}}\t{{.Names}}\t{{.Ports}}',
  ]);

  if (dockerResult.error) {
    console.error('Docker does not appear to be running or is not on PATH:', dockerResult.error.message);
    return;
  }

  const containers = dockerResult.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, image, name, ports = ''] = line.split('\t');
      return { id, image, name, ports };
    });

  if (!containers.length) {
    console.log('No Docker containers are running.');
    return;
  }

  containers.forEach((container) => {
    console.log(`  ${container.id} | ${container.image} | ${container.name}`);
    if (container.ports) {
      parseDockerPorts(container.ports).forEach((port) => {
        if (port.hostPort && port.containerPort) {
          console.log(`    Port mapping: host ${port.hostPort} -> container ${port.containerPort}`);
        } else if (port.original) {
          console.log(`    Port entry: ${port.original}`);
        }
      });
    }
  });

  const mapped = containers.find((container) =>
    parseDockerPorts(container.ports).some((mapping) => mapping.containerPort === '5432')
  );

  if (mapped) {
    console.log(`\n  Container ${mapped.id} maps host port 5432 (check if it conflicts with local Postgres).`);
  } else {
    console.log('\n  No container explicitly maps container port 5432 to the host.');
  }
}

function inspectCompose() {
  printSection('Docker Compose expectations');
  const composePath = COMPOSE_FILES.map((name) => path.join(ROOT, name)).find((file) => fs.existsSync(file));
  if (!composePath) {
    console.log('No docker-compose.yml/yaml found at the repo root.');
    return;
  }

  const content = fs.readFileSync(composePath, 'utf8');
  const doc = YAML.parse(content);
  if (!doc || !doc.services) {
    console.log(`Parsed ${path.basename(composePath)} but no services were found.`);
    return;
  }

  const entries = Object.entries(doc.services);
  const serviceEntry =
    entries.find(([name, service]) => {
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
      return identifiers.some((identifier) => identifier.includes('postgres'));
    }) || entries[0];

  if (!serviceEntry) {
    console.log(`No services detected in ${path.basename(composePath)}.`);
    return;
  }

  const [serviceName, serviceConfig] = serviceEntry;
  console.log(`  Service: ${serviceName}`);
  console.log(`  From ${path.relative(ROOT, composePath)}`);
  const env = serviceConfig?.environment || serviceConfig?.env || {};
  const normalizedEnv = Array.isArray(env)
    ? env
    : Object.entries(env).map(([key, value]) => `${key}=${value}`);

  console.log('  Expected PostgreSQL environment:');
  normalizedEnv.forEach((entry) => {
    console.log(`    ${entry}`);
  });

  const ports = serviceConfig?.ports;
  const portEntries = Array.isArray(ports) ? ports : ports ? [ports] : [];
  if (portEntries.length) {
    console.log('  Ports defined:');
    portEntries.forEach((port) => console.log(`    ${port}`));
  } else {
    console.log('  No ports explicitly mapped in compose file.');
  }
}

function main() {
  console.log('Diagnosing port 5432 and Docker Postgres status...');
  diagnosePort();
  diagnoseDocker();
  inspectCompose();
  console.log('\nReview the output above, adjust Docker host port if needed, then rerun `npm run db:sync-env`.');
}

main();
