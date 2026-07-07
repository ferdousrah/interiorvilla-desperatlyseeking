module.exports = {
  apps: [{
    name: 'desperatelyseeking-backend',
    script: 'npm',
    args: 'start',
    cwd: '/home/joybangla/desperatelyseeking-backend',
    env: {
      NODE_ENV: 'production',
      TMPDIR: '/home/joybangla/app-tmp',
      TMP: '/home/joybangla/app-tmp',
      TEMP: '/home/joybangla/app-tmp'
    }
  }]
}
