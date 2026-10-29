module.exports = {
  apps: [
    {
      name: 'friends-arcade',
      script: 'node',
      args: '--loader tsx server/src/server.ts',
      instances: 1, // Single in-memory instance (no clustering, state in server RAM)
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
