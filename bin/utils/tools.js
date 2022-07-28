const path = require('path');
const fs = require('fs');

const cwd = process.cwd();

/**
 * 从项目中读取 bi-open 这个包, 获得最新的订正版本号
 */
function getRevisalLatestVersion() {
  try {
    const { LATEST_VERSION } = require(path.resolve(cwd, `node_modules/bi-open`));
    return LATEST_VERSION;
  } catch (e) {
    console.error(e)
    // return '4.0.3'
    return '';
  }
}

// 为 packageJSON 添加额外信息
function appendExtraInfoToPackageJSON(webpackConfig) {
  // 复制 package.json 到 build 下, 并添加额外信息
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(cwd, './package.json'), 'utf8')
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

  const latestRevisalVersion = getRevisalLatestVersion();
  packageJson.revisalInfo = {
    version: packageJson.revisalInfo?.version || latestRevisalVersion
  }

  return packageJson;
}


function ensure(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

module.exports = {
  getRevisalLatestVersion,
  appendExtraInfoToPackageJSON,
  ensure
};
