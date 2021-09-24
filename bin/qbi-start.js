const program = require('commander');
const WebpackDevServer = require('webpack-dev-server');
const logger = require('./utils/logger');
const { getWebpackConfig } = require('./utils/webpack-config');
const webpack = require('webpack');
const net = require('net');

const options = process.argv;
program.option('-a, --analyze [analyze]', 'Analyze the bundle', false);

program.parse(options);

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
  })
  .catch(err => {
    logger.error('LOAD ERROR', err);
    stopServer();
  });

//clean up
function stopServer() {
  logger.blank();
  logger.info('Stopping server...');
  if (server) {
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

process.on('exit', stopServer);
process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);
