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
    let mkcertFile = path.resolve(cwd, './node_modules/qbi-mkcert/files/mkcert');

    if (!fs.existsSync(mkcertFile)) {
      mkcertFile = path.resolve(__dirname, '../node_modules/qbi-mkcert/files/mkcert');
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



