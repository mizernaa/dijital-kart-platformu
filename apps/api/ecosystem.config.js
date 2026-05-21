module.exports = {
  apps: [{
    name: 'dkp-api',
    script: 'src/index.ts',
    interpreter: 'node',
    interpreter_args: '--require ts-node/register',
    cwd: 'c:\\Users\\HP\\Desktop\\projem\\dijital-kart-platformu\\apps\\api',
    env: {
      DATABASE_URL: 'postgresql://postgres@127.0.0.1:5432/dijital_kart_db',
      TS_NODE_TRANSPILE_ONLY: 'true',
      NODE_ENV: 'development',
      API_PORT: '3001',
      JWT_ACCESS_SECRET: 'dkp-access-secret-super-gizli-2026-min32',
      JWT_REFRESH_SECRET: 'dkp-refresh-secret-super-gizli-2026-min32',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
      FRONTEND_URL: 'http://localhost:3000',
      PUBLIC_SITE_URL: 'http://localhost:3002',
      RESEND_API_KEY: 're_placeholder',
      EMAIL_FROM: 'noreply@dijitalkart.com',
      UPLOAD_DIR: 'uploads'
    }
  }]
}
