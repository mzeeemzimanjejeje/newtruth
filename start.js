// TRUTH-MD — Pterodactyl Entry Point
// Pterodactyl startup file: start.js

const { execSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");

process.env.NODE_ENV = "production";
process.env.FRONTEND_DIST = path.join(__dirname, "artifacts/truth-md/dist/public");

// Install pnpm globally if not available
try {
  execSync("pnpm --version", { stdio: "ignore" });
} catch {
  console.log("[TRUTH-MD] Installing pnpm...");
  execSync("npm install -g pnpm", { stdio: "inherit" });
}

// Install project dependencies if not present
if (!existsSync(path.join(__dirname, "node_modules", ".modules.yaml"))) {
  console.log("[TRUTH-MD] Installing dependencies...");
  execSync("pnpm install", { stdio: "inherit", cwd: __dirname });
}

console.log("[TRUTH-MD] Starting server...");

// Launch the pre-built server
import(path.join(__dirname, "artifacts/api-server/dist/index.js")).catch((err) => {
  console.error("[TRUTH-MD] Failed to start server:", err.message);
  process.exit(1);
});
