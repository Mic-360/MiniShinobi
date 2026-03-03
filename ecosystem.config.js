module.exports = {
  apps: [
    {
      name: 'minishinobi-backend',
      script: 'src/app.js',
      cwd: '/data/data/com.termux/files/home/MiniShinobi/backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '400M',
      env: { NODE_ENV: 'production' },
      error_file:
        '/data/data/com.termux/files/home/MiniShinobi/logs/backend-error.log',
      out_file:
        '/data/data/com.termux/files/home/MiniShinobi/logs/backend-out.log',
    },
    {
      name: 'minishinobi-nginx',
      script: 'nginx',
      args: '-c /data/data/com.termux/files/home/MiniShinobi/nginx/nginx.conf -g "daemon off;"',
      interpreter: 'none',
      watch: false,
      error_file:
        '/data/data/com.termux/files/home/MiniShinobi/logs/nginx-error.log',
      out_file:
        '/data/data/com.termux/files/home/MiniShinobi/logs/nginx-out.log',
    },
    {
      name: 'minishinobi-tunnel',
      script: 'cloudflared',
      args: 'tunnel run minishinobi-dashboard',
      interpreter: 'none',
      watch: false,
      restart_delay: 5000,
      error_file:
        '/data/data/com.termux/files/home/MiniShinobi/logs/tunnel-error.log',
      out_file:
        '/data/data/com.termux/files/home/MiniShinobi/logs/tunnel-out.log',
    },
  ],
};
