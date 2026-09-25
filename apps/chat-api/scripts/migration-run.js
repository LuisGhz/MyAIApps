#!/usr/bin/env bun

/**
 * Cross-platform migration script helper.
 * Replaces cross-var for running TypeORM migration generation/creation commands.
 *
 * Usage:
 *   npm run migration:<module>:generate --name=<MigrationName>
 *   npm run migration:<module>:create   --name=<MigrationName>
 */

const { spawnSync } = require('node:child_process');

const [, , moduleName, action, ...arguments_] = process.argv;
const nameArgument = arguments_.find((argument) => argument.startsWith('--name='));
const name = nameArgument?.slice('--name='.length) || process.env.npm_config_name || '';

if (!name) {
  console.error(
    'Error: Migration name is required.\n' +
      'Usage: npm run migration:<module>:<action> --name=<MigrationName>\n' +
      'Example: npm run migration:user:generate --name=AddEmailIndex',
  );
  process.exit(1);
}

const dataSource = 'src/config/db/db.datasource.ts';
const migrationPath = `src/modules/${moduleName}/migrations/${name}`;

let commandArguments;
if (action === 'generate') {
  commandArguments = [
    'run',
    'typeorm',
    'migration:generate',
    '-d',
    dataSource,
    migrationPath,
  ];
} else if (action === 'create') {
  commandArguments = ['run', 'typeorm', 'migration:create', migrationPath];
} else {
  console.error(`Unknown action: ${action}. Use "generate" or "create".`);
  process.exit(1);
}

const result = spawnSync('bun', commandArguments, {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
