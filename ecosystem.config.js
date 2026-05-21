const NEXT_BIN = 'C:\\Users\\HP\\Desktop\\projem\\dijital-kart-platformu\\node_modules\\next\\dist\\bin\\next'

module.exports = {
  apps: [
    {
      name: 'dkp-web',
      script: NEXT_BIN,
      args: 'dev -p 3000',
      cwd: 'C:\\Users\\HP\\Desktop\\projem\\dijital-kart-platformu\\apps\\web',
      interpreter: 'node',
    },
    {
      name: 'dkp-public',
      script: NEXT_BIN,
      args: 'dev -p 3002',
      cwd: 'C:\\Users\\HP\\Desktop\\projem\\dijital-kart-platformu\\apps\\public-site',
      interpreter: 'node',
    },
  ],
}
