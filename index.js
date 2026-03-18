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

// Install pnpm if not available
try {
  execSync('pnpm --version', { stdio: 'ignore' });
} catch {
  console.log('[TRUTH-MD] Installing pnpm...');
  execSync('npm install -g pnpm', { stdio: 'inherit' });
}

// Use pnpm --prod from root — it understands workspace:* and skips dev deps like esbuild
const modulesReady = existsSync(path.join(__dirname, 'node_modules', '.modules.yaml'));
if (!modulesReady) {
  console.log('[TRUTH-MD] Installing production dependencies...');
  execSync('pnpm install --prod', { stdio: 'inherit', cwd: __dirname });
}

console.log('[TRUTH-MD] Starting server on port ' + process.env.PORT + '...');

// Launch the pre-built server
const server = spawn('node', ['artifacts/api-server/dist/index.js'], {
  cwd: __dirname,
  env: { ...process.env },
  stdio: 'inherit',
});

server.on('exit', (code) => process.exit(code || 0));
