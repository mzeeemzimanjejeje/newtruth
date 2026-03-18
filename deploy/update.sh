#!/bin/bash
# ============================================================
#  TRUTH-MD — Update Script
#  Run this on your VPS after pushing changes to GitHub.
#  Usage: ./deploy/update.sh
# ============================================================

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   TRUTH-MD Update                    ║"
echo "╚══════════════════════════════════════╝"
echo ""

echo "[1/4] Pulling latest from GitHub..."
git pull origin main

echo "[2/4] Installing dependencies..."
pnpm install

echo "[3/4] Rebuilding..."
BASE_PATH="/" pnpm --filter @workspace/truth-md build
pnpm --filter @workspace/api-server build

echo "[4/4] Restarting server..."
pm2 restart truth-md

echo ""
echo "✓ Update complete! Site is live with latest changes."
echo "  Check logs: pm2 logs truth-md"
echo ""
