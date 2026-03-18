// PM2 Ecosystem Config for TRUTH-MD Pairing Site
// Run with: pm2 start deploy/ecosystem.config.cjs
// Save process list: pm2 save
// Auto-start on reboot: pm2 startup

module.exports = {
  apps: [
    {
      name: "truth-md",
      script: "./artifacts/api-server/dist/index.js",
      cwd: "/root/truth-md",   // <-- Change this to your project path on VPS
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: "3500",
        // Path to built frontend files (relative to this project root)
        FRONTEND_DIST: "./artifacts/truth-md/dist/public",
      },
      // Auto-restart on crash
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      // Logging
      out_file: "./logs/truth-md-out.log",
      error_file: "./logs/truth-md-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
