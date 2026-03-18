// TRUTH-MD — Pterodactyl Entry Point
'use strict';

const { execSync, spawn } = require('child_process');
const { existsSync, mkdirSync, symlinkSync } = require('fs');
const path = require('path');

// Pull latest updates from GitHub on every restart
try {
  console.log('[TRUTH-MD] Pulling latest updates from GitHub...');
  execSync('git pull', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
  console.log('[TRUTH-MD] Git pull skipped:', e.message);
}

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

// Symlink Baileys into api-server/node_modules so ESM resolution finds it
const apiModules = path.join(__dirname, 'artifacts/api-server/node_modules');
const linkTarget = path.join(apiModules, '@whiskeysockets');
if (!existsSync(linkTarget)) {
  mkdirSync(apiModules, { recursive: true });
  try {
    symlinkSync(
      path.join(runtimeDeps, 'node_modules', '@whiskeysockets'),
      linkTarget
    );
    console.log('[TRUTH-MD] Baileys linked.');
  } catch (e) {
    // Already exists or permission issue — copy instead
    execSync(
      `cp -r "${path.join(runtimeDeps, 'node_modules', '@whiskeysockets')}" "${linkTarget}"`,
      { stdio: 'inherit' }
    );
  }
}

console.log('[TRUTH-MD] Starting server on port ' + process.env.PORT + '...');

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
