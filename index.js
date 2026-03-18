// TRUTH-MD — Pterodactyl Entry Point
'use strict';

const { execSync, spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Default PORT to 3000 if Pterodactyl hasn't set it
if (!process.env.PORT) {
  process.env.PORT = '3000';
}
process.env.NODE_ENV = 'production';
process.env.FRONTEND_DIST = path.join(__dirname, 'artifacts/truth-md/dist/public');

const apiDir = path.join(__dirname, 'artifacts/api-server');
const nodeModules = path.join(apiDir, 'node_modules');

// Install only production deps for the api-server (skips esbuild and other dev tools)
if (!existsSync(nodeModules)) {
  console.log('[TRUTH-MD] Installing production dependencies...');
  execSync('npm install --omit=dev', { stdio: 'inherit', cwd: apiDir });
}

console.log('[TRUTH-MD] Starting server on port ' + process.env.PORT + '...');

// Launch the pre-built server
const server = spawn('node', ['dist/index.js'], {
  cwd: apiDir,
  env: { ...process.env },
  stdio: 'inherit',
});

server.on('exit', (code) => process.exit(code || 0));
