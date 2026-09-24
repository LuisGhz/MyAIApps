#!/usr/bin/env node

/**
 * Cross-platform migration script helper.
 * Replaces cross-var for running TypeORM migration generation/creation commands.
 *
 * Usage:
 *   npm run migration:<module>:generate --name=<MigrationName>
 *   npm run migration:<module>:create   --name=<MigrationName>
 */

const { execSync } = require('node:child_process');

const [, , module, action] = process.argv;
const name = process.env.npm_config_name || '';

if (!name) {
  console.error(
    'Error: Migration name is required.\n' +
      'Usage: npm run migration:<module>:<action> --name=<MigrationName>\n' +
      'Example: npm run migration:user:generate --name=AddEmailIndex',
  );
  process.exit(1);
}

const dataSource = 'src/config/db/db.datasource.ts';
const migrationPath = `src/modules/${module}/migrations/${name}`;

let command;
if (action === 'generate') {
  command = `npm run typeorm migration:generate -- -d ${dataSource} ${migrationPath}`;
} else if (action === 'create') {
  command = `npm run typeorm migration:create -- ${migrationPath}`;
} else {
  console.error(`Unknown action: ${action}. Use "generate" or "create".`);
  process.exit(1);
}

try {
  execSync(command, { stdio: 'inherit' });
} catch (e) {
  process.exit(e.status || 1);
}
