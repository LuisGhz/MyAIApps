#!/usr/bin/env node

/**
 * TypeORM CLI wrapper for production use
 * This script runs TypeORM CLI commands using compiled JavaScript files
 * instead of requiring TypeScript dependencies (ts-node, tsconfig-paths)
 */

const { exec } = require('node:child_process');
const path = require('node:path');


// Get command from arguments (e.g., "migration:run", "migration:revert", "migration:show")
const command = process.argv[2];

if (!command) {
  console.error('Error: No command provided');
  console.error('Usage: node typeorm-cli.js <command>');
  console.error('Example: node typeorm-cli.js migration:run');
  process.exit(1);
}

// Path to compiled datasource
const datasourcePath = path.join(
  __dirname,
  'dist',
  'config',
  'db',
  'db.datasource.js',
);

// Build the TypeORM CLI command
const typeormCmd = `node node_modules/typeorm/cli.js ${command} -d ${datasourcePath}`;

console.log(`Running: ${typeormCmd}`);

// Execute the command
const child = exec(typeormCmd, (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  if (error) {
    console.error(
      `Error: Migration command failed with exit code ${error.code}`,
    );
    process.exit(error.code || 1);
  }
});

// Forward output in real-time
child.stdout.on('data', (data) => process.stdout.write(data));
child.stderr.on('data', (data) => process.stderr.write(data));

// Handle exit
child.on('exit', (code) => {
  process.exit(code);
});
