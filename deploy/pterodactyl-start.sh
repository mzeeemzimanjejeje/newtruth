#!/bin/bash
# ============================================================
#  TRUTH-MD — Pterodactyl Startup Script
#  Set this as your startup command in Pterodactyl:
#  bash deploy/pterodactyl-start.sh
# ============================================================

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   TRUTH-MD Starting...               ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Pull latest from GitHub on every restart
echo "[1/4] Pulling latest changes from GitHub..."
git pull origin main || echo "Git pull skipped (no changes or no network)"

# Install dependencies
echo "[2/4] Installing dependencies..."
npm install -g pnpm --silent 2>/dev/null || true
pnpm install

# Build frontend + backend
echo "[3/4] Building..."
BASE_PATH="/" pnpm --filter @workspace/truth-md build
pnpm --filter @workspace/api-server build

# Start the server
echo "[4/4] Starting server on port $PORT..."
echo ""
NODE_ENV=production node artifacts/api-server/dist/index.js
