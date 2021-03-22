const fs = require('fs');
const logger = require('../bin/utils/logger');
const path = require('path');
const cwd = process.cwd();
const child_process = require('child_process');

const execSync = child_process.execSync;

try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(cwd, './package.json'), 'utf8'),
  );

  logger.info(`adding tag v${packageJson.version}`)
  execSync(`git tag v${packageJson.version} && git push --tags`);
} catch (err) {
  logger.error(err);
}
