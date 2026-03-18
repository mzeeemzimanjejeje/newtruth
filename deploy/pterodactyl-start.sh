#!/bin/bash
# ============================================================
#  TRUTH-MD — Pterodactyl Startup Script
#  Startup command in Pterodactyl: bash deploy/pterodactyl-start.sh
#  Just upload files and tap Start — no extra config needed.
# ============================================================

echo "Starting TRUTH-MD..."

# Install pnpm if not present
npm install -g pnpm --silent 2>/dev/null || true

# Install dependencies (fast if already installed)
pnpm install

# Start the pre-built server
NODE_ENV=production \
FRONTEND_DIST="./artifacts/truth-md/dist/public" \
node artifacts/api-server/dist/index.js
