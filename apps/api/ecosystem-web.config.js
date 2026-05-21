module.exports = {
  apps: [
    {
      name: 'dkp-web',
      script: 'c:\\Users\\HP\\Desktop\\projem\\dijital-kart-platformu\\node_modules\\next\\dist\\bin\\next',
      args: 'dev -p 3000',
      cwd: 'c:\\\\Users\\\\HP\\\\Desktop\\\\projem\\\\dijital-kart-platformu\\\\apps\\\\web',
      interpreter: 'node',
      env: {
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
        NEXT_PUBLIC_PUBLIC_SITE_URL: 'http://localhost:3002',
        NODE_ENV: 'development'
      }
    },
    {
      name: 'dkp-public',
      script: 'c:\\Users\\HP\\Desktop\\projem\\dijital-kart-platformu\\node_modules\\next\\dist\\bin\\next',
      args: 'dev -p 3002',
      cwd: 'c:\\\\Users\\\\HP\\\\Desktop\\\\projem\\\\dijital-kart-platformu\\\\apps\\\\public-site',
      interpreter: 'node',
      env: {
        API_URL: 'http://localhost:3001',
        NEXT_PUBLIC_API_URL: 'http://localhost:3001',
        NODE_ENV: 'development'
      }
    }
  ]
}
