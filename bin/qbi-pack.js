const fs = require('fs');
const logger = require('./utils/logger');
const archiver = require('archiver');
const path = require('path');

const cwd = process.cwd();
const options = process.argv;

// 打包文件
const files = [
  path.resolve(cwd, './build/main.js'),
  path.resolve(cwd, './build/meta.js'),
  path.resolve(cwd, './build/main.css'),
  path.resolve(cwd, './package.json'),
];

logger.info('packing...');

let packageJson;

try {
  packageJson = JSON.parse(
    fs.readFileSync(path.resolve(cwd, './package.json'), 'utf8'),
  );
} catch (err) {
  logger.error(err);
}

const outputFileName = packageJson
  ? `${packageJson.name || ''}-${packageJson.version || ''}.zip`
  : './component.zip';

const output = fs.createWriteStream(path.resolve(cwd, 'build', outputFileName));
const archive = archiver('zip');

output.on('close', function () {
  logger.info(archive.pointer() + ' total bytes');
  logger.info('pack finish.');
});

archive.on('error', function (err) {
  logger.error(err);
  throw err;
});

archive.pipe(output);

files
  .reduce(
    (prev, file) =>
      prev.append(fs.createReadStream(file), { name: path.basename(file) }),
    archive,
  )
  .finalize();
