#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');

const relativeEnvPath =
  path.relative(process.cwd(), envPath) || path.basename(envPath);

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  exitWithError(
    [
      `Prisma commands require ${relativeEnvPath} to exist with DATABASE_URL defined.`,
      'Create one by running:',
      '  cp .env.example .env          # Unix/macOS',
      '  copy .env.example .env        # PowerShell/Windows',
      'Then update the database credentials before retrying.',
    ].join('\n')
  );
}

const rawEnvContent = fs.readFileSync(envPath, 'utf8');
const lines = rawEnvContent.split(/\r?\n/);
const databaseLine = lines.find((line) => {
  const trimmed = line.trim();
  return (
    trimmed &&
    !trimmed.startsWith('#') &&
    /^DATABASE_URL\s*=/.test(trimmed)
  );
});

if (!databaseLine) {
  exitWithError(
    [
      `DATABASE_URL is missing from ${relativeEnvPath}.`,
      'Add a DATABASE_URL entry (see .env.example) so Prisma can connect to the database.',
    ].join('\n')
  );
}

const separatorIndex = databaseLine.indexOf('=');
const value =
  separatorIndex >= 0 ? databaseLine.slice(separatorIndex + 1).trim() : '';
const normalizedValue = value
  .replace(/^"(.*)"$/, '$1')
  .replace(/^'(.*)'$/, '$1');

if (!normalizedValue) {
  exitWithError(
    [
      `DATABASE_URL is defined in ${relativeEnvPath} but has no value.`,
      'Provide a valid connection string before running Prisma commands.',
    ].join('\n')
  );
}
