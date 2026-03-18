// TRUTH-MD — Pterodactyl Entry Point
'use strict';

const { spawn } = require('child_process');
const path = require('path');

// Default PORT to 3000 if not set by Pterodactyl
if (!process.env.PORT) {
  process.env.PORT = '3000';
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
