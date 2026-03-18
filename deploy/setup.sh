#!/bin/bash
# ============================================================
#  TRUTH-MD Pairing Site — VPS Setup Script
#  VPS IP  : 77.237.242.128
#  Domain  : newpair.courtneytech.xyz
#
#  Usage:
#    cd /root/truth-md
#    chmod +x deploy/setup.sh
#    ./deploy/setup.sh
# ============================================================

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   TRUTH-MD Pairing Site Setup        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Check Node.js ───────────────────────────────────────
echo "[1/6] Checking Node.js..."
if ! command -v node &> /dev/null; then
  echo "  Node.js not found. Installing via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
else
  echo "  Node.js $(node -v) found ✓"
fi

# ── 2. Check/Install pnpm ──────────────────────────────────
echo "[2/6] Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
  echo "  Installing pnpm..."
  npm install -g pnpm
else
  echo "  pnpm $(pnpm -v) found ✓"
fi

# ── 3. Check/Install PM2 ──────────────────────────────────
echo "[3/6] Checking PM2..."
if ! command -v pm2 &> /dev/null; then
  echo "  Installing PM2..."
  npm install -g pm2
else
  echo "  PM2 found ✓"
fi

# ── 4. Install dependencies ───────────────────────────────
echo "[4/6] Installing dependencies..."
pnpm install --frozen-lockfile

# ── 5. Build frontend + backend ───────────────────────────
echo "[5/6] Building project..."

echo "  Building frontend..."
BASE_PATH="/" pnpm --filter @workspace/truth-md build

echo "  Building API server..."
pnpm --filter @workspace/api-server build

echo "  Build complete ✓"

# ── 6. Start with PM2 ─────────────────────────────────────
echo "[6/6] Starting server with PM2..."
mkdir -p /root/truth-md/logs

pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  TRUTH-MD is running on port 3500!                       ║"
echo "║                                                          ║"
echo "║  Next — set up nginx + SSL:                              ║"
echo "║                                                          ║"
echo "║  sudo cp deploy/nginx.conf \                             ║"
echo "║    /etc/nginx/sites-available/truth-md                   ║"
echo "║  sudo ln -s /etc/nginx/sites-available/truth-md \        ║"
echo "║    /etc/nginx/sites-enabled/truth-md                     ║"
echo "║  sudo nginx -t && sudo systemctl reload nginx            ║"
echo "║  sudo certbot --nginx -d newpair.courtneytech.xyz        ║"
echo "║                                                          ║"
echo "║  Site will be live at:                                   ║"
echo "║  https://newpair.courtneytech.xyz                        ║"
echo "║                                                          ║"
echo "║  Logs: pm2 logs truth-md                                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
