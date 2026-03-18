// TRUTH-MD — Pterodactyl Entry Point
'use strict';

const { execSync, spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Install pnpm if not available
try {
  execSync('pnpm --version', { stdio: 'ignore' });
} catch {
  console.log('[TRUTH-MD] Installing pnpm...');
  execSync('npm install -g pnpm', { stdio: 'inherit' });
}

// Install dependencies if missing
if (!existsSync(path.join(__dirname, 'node_modules', '.modules.yaml'))) {
  console.log('[TRUTH-MD] Installing dependencies...');
  execSync('pnpm install', { stdio: 'inherit', cwd: __dirname });
}

console.log('[TRUTH-MD] Starting server...');

// Launch the pre-built server
const server = spawn('node', ['artifacts/api-server/dist/index.js'], {
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    FRONTEND_DIST: path.join(__dirname, 'artifacts/truth-md/dist/public'),
  },
  stdio: 'inherit',
});

server.on('exit', (code) => process.exit(code || 0));
