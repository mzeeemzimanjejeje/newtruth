// PM2 Ecosystem Config for TRUTH-MD Pairing Site
// Run with: pm2 start deploy/ecosystem.config.cjs
// Save process list: pm2 save
// Auto-start on reboot: pm2 startup

module.exports = {
  apps: [
    {
      name: "truth-md",
      script: "./artifacts/api-server/dist/index.js",
      cwd: "/root/truth-md",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: "3500",
        FRONTEND_DIST: "/root/truth-md/artifacts/truth-md/dist/public",
      },
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      out_file: "/root/truth-md/logs/out.log",
      error_file: "/root/truth-md/logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
