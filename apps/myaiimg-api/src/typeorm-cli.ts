#!/usr/bin/env bun

/**
 * TypeORM CLI wrapper for production use with Bun
 * This script runs TypeORM CLI commands using compiled JavaScript files
 * instead of requiring TypeScript dependencies (ts-node, tsconfig-paths)
 */

import { spawnSync } from 'child_process';
import path from 'path';

// Get command from arguments (e.g., "migration:run", "migration:revert", "migration:show")
const command = process.argv[2];

if (!command) {
  console.error('Error: No command provided');
  console.error('Usage: bun typeorm-cli.ts <command>');
  console.error('Example: bun typeorm-cli.ts migration:run');
  process.exit(1);
}

// Path to compiled datasource
const datasourcePath = path.join(
  process.cwd(),
  'dist',
  'config',
  'db',
  'typeorm.datasource.config.js',
);

// Build the TypeORM CLI command using bun
const typeormCliPath = path.join(
  process.cwd(),
  'node_modules',
  'typeorm',
  'cli.js',
);

console.log(`Running: bun ${typeormCliPath} ${command} -d ${datasourcePath}`);

// Execute the command using bun
const result = spawnSync('bun', [typeormCliPath, command, '-d', datasourcePath], {
  stdio: 'inherit',
  env: process.env,
});

// Exit with the same code as the child process
process.exit(result.status ?? 1);
