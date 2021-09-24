const program = require('commander');
const logger = require('./utils/logger');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

const { getWebpackConfig } = require('./utils/webpack-config');
const options = process.argv;

const cwd = process.cwd();
program.option('-a, --analyze [analyze]', 'Analyze the bundle', false);

program.parse(options);

try {
  logger.info('Building...');
  const webpackConfig = getWebpackConfig({
    mode: 'production',
    analyze: program.analyze,
  });

  let compiler = webpack(webpackConfig);
  compiler.run(function (err, stats) {
    if (err) {
      throw err
    }
    if (stats && stats.hasErrors()) {
      const info = stats.toJson();
      throw Error(info.errors.join(os.EOL + os.EOL));
    }

    // 复制 package.json 到 build 下, 并添加额外信息
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(cwd, './package.json'), 'utf8'),
    );

    // 为 package.json 写入 webpack config 信息
    if (
      webpackConfig.externals &&
      typeof webpackConfig.externals === 'object' &&
      Object.keys(webpackConfig.externals).length > 0
    ) {
      packageJson.webpack = {};
      packageJson.webpack.externals = webpackConfig.externals;
    }

    // 从项目中读取 bi-open 这个包, 获得最新的订正版本号
    try {
      const { LATEST_VERSION } = require(path.resolve(cwd, `node_modules/bi-open`))
      packageJson.revisalInfo = {}
      packageJson.revisalInfo.version = LATEST_VERSION
    } catch (e) { }

    // 写入 package.json
    fs.writeFileSync(path.resolve(cwd, './build/package.json'), JSON.stringify(packageJson), {
      encoding: 'utf8',
    });

    process.exit(0);
  });
} catch (err) {
  logger.error('BUILD ERROR');
  console.error(err)
  process.exit(1);
}
