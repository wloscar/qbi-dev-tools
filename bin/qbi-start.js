const program = require('commander');
const WebpackDevServer = require('webpack-dev-server');
const logger = require('./utils/logger');
const { getWebpackConfig } = require('./utils/webpack-config');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { appendExtraInfoToPackageJSON } = require('./utils/tools');

const options = process.argv;
program.option('-a, --analyze [analyze]', 'Analyze the bundle', false);

program.parse(options);
const cwd = process.cwd();

let server;
logger.blank();
logger.info('Starting server...');
const webpackConfig = getWebpackConfig({
  mode: 'development',
  analyze: program.analyze,
});
checkServer(webpackConfig.devServer.port, webpackConfig.devServer.host)
  .then(() => {
    let compiler = webpack(webpackConfig);

    server = new WebpackDevServer(compiler, webpackConfig.devServer);
    server.listen(
      webpackConfig.devServer.port,
      webpackConfig.devServer.host,
      () => {
        logger.info(
          `DevServer listening on port ${webpackConfig.devServer.port}`,
        );
      },
    );
    const packageJson = appendExtraInfoToPackageJSON(webpackConfig);

    // 写入 package.json
    fs.writeFileSync(path.resolve(cwd, 'public/package.json'), JSON.stringify(packageJson, null, 2), {
      encoding: 'utf8',
    });
  })
  .catch(err => {
    logger.error('LOAD ERROR', err);
    stopServer();
  });

//clean up
function stopServer() {
  logger.blank();
  if (server) {
    logger.info('Stopping server...');
    server.close();
    server = null;
  }
  process.exit(0);
}

function checkServer(port, host) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', err => {
      reject(err);
    });
    server.once('listening', function () {
      server.close();
    });
    server.once('close', function () {
      resolve();
    });
    server.listen(port, host);
  });
}

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach(eventType => {
  process.on(eventType, () => {
    stopServer()
  });
});