#!/usr/bin/env bun

import { spawnSync } from 'child_process';
import path from 'path';

const command = process.argv[2];

if (!command) {
  console.error('Error: No command provided');
  console.error('Usage: bun dist/typeorm-cli.js <command>');
  console.error('Example: bun dist/typeorm-cli.js migration:run');
  process.exit(1);
}

const datasourcePath = path.join(
  process.cwd(),
  'dist',
  'config',
  'db',
  'db.datasource.js',
);

const typeormCliPath = path.join(
  process.cwd(),
  'node_modules',
  'typeorm',
  'cli.js',
);

console.log(`Running: bun ${typeormCliPath} ${command} -d ${datasourcePath}`);

const result = spawnSync('bun', [typeormCliPath, command, '-d', datasourcePath], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);