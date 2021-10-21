const program = require('commander');
const logger = require('./utils/logger');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { ensure } = require('./utils/tools');

const cwd = process.cwd();
const certDefaultDir = path.resolve(os.homedir(), '.qbi-cert');

program.option('-d, --dest [dest]', 'ssl folder', certDefaultDir);
program.parse(process.argv);


function installSSL() {
  try {
    const destDir = program.dest
    ensure(destDir)

    const keyFile = path.resolve(destDir, 'dev.key');
    const certFile = path.resolve(destDir, 'dev.pem');
    const hostlist = ['localhost', '127.0.0.1', '::1'];
    let mkcertFile;


    const platform = os.platform();
    switch (platform) {
      case 'darwin':
        mkcertFile = path.resolve(cwd, './node_modules/qbi-mkcert/darwin/mkcert');
        if (!fs.existsSync(mkcertFile)) {
          mkcertFile = path.resolve(__dirname, '../node_modules/qbi-mkcert/darwin/mkcert');
        }
        break;
      case 'win32':
        mkcertFile = path.resolve(cwd, './node_modules/qbi-mkcert/win32/mkcert.exe');
        if (!fs.existsSync(mkcertFile)) {
          mkcertFile = path.resolve(__dirname, '../node_modules/qbi-mkcert/win32/mkcert.exe');
        }
        break;
    }

    if (!mkcertFile) {
      throw new Error('get mkcert failed')
    }
    fs.chmodSync(mkcertFile, 0o777);

    // 安装证书
    const cmd = `${mkcertFile} -install -key-file ${keyFile} -cert-file ${certFile} ${hostlist.join(' ')}`;
    execSync(cmd);

  } catch (e) {
    logger.error(e);
  }
}

installSSL()



