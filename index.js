// TRUTH-MD — Pterodactyl Entry Point
'use strict';

const { execSync, spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Pterodactyl sets SERVER_PORT — fall back to PORT, then 3000
if (!process.env.PORT) {
  process.env.PORT = process.env.SERVER_PORT || '3000';
}

// Install Baileys into its own clean folder (no workspace: deps — plain npm works)
const runtimeDeps = path.join(__dirname, 'artifacts/api-server/runtime-deps');
const baileysInstalled = existsSync(
  path.join(runtimeDeps, 'node_modules', '@whiskeysockets', 'baileys')
);

if (!baileysInstalled) {
  console.log('[TRUTH-MD] Installing WhatsApp (Baileys) library...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit', cwd: runtimeDeps });
}

// CJS respects NODE_PATH — point it at runtime-deps so require('@whiskeysockets/baileys') works
const existing = process.env.NODE_PATH || '';
process.env.NODE_PATH = existing
  ? `${existing}${path.delimiter}${runtimeDeps}/node_modules`
  : `${runtimeDeps}/node_modules`;

console.log('[TRUTH-MD] Starting server on port ' + process.env.PORT + '...');

const server = spawn('node', ['artifacts/api-server/dist/index.cjs'], {
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    FRONTEND_DIST: path.join(__dirname, 'artifacts/truth-md/dist/public'),
  },
  stdio: 'inherit',
});

server.on('exit', (code) => process.exit(code || 0));
