const program = require('commander');
const logger = require('./utils/logger');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { appendExtraInfoToPackageJSON } = require('./utils/tools');
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

    const packageJson = appendExtraInfoToPackageJSON(webpackConfig);

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
