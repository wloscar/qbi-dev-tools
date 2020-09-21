const fs = require('fs');
const rimraf = require('rimraf');
const child_process = require('child_process');

const checkArg = require('../utils/checkArg.js');

module.exports = (projectName, language) => {
  checkArg(
    projectName.match(/^[a-z][a-z0-9_-]+$/),
    `The project must start with a letter and can only contain these symbols: a-z, 0-9, -, _`
  );

  checkArg(
    ['js', 'ts'].indexOf(language) !== -1,
    `The project language should be in: ts, js`
  );

  checkArg(
   !fs.existsSync(`./${projectName}`),
    `File or folder "./${projectName}" already exists`
  );

  const repo = `git@gitlab.alibaba-inc.com:deepinsight/di-open-demo-${language}.git`;

  console.log(`Creating new project "${projectName}" now!`);
  console.log('');

  const execSync = child_process.execSync;
  const cmd = `git clone --quiet --depth=1 --branch=master ${repo} ./${projectName}`;

  console.log(`--> Running: ${cmd}`);
  execSync(cmd);

  const projectPackage = `./${projectName}/package.json`;

  fs.readFile(projectPackage, 'utf8', function(err, data) {
    if (err) {
      rimraf.sync(`./${projectName}`);
      console.log('--> Clone failed');
      return console.log(err);
    }
    console.log('--> Clone succeeded');

    console.log(`--> Removing ./${projectName}/.git`);
    rimraf.sync(`./${projectName}/.git`);

    console.log('--> Updating package.json');

    const json = JSON.parse(data);
    json.name = projectName;
    json.author = 'Write your name here';
    json.version = '0.1.0';
    // 修改打包的文件名
    json.scripts.zip = json.scripts.zip.replace('di-open-demo', projectName);

    fs.writeFile(projectPackage, JSON.stringify(json, null, 2), function() {
      console.log('');
      console.log(`执行完毕！下一步:`);
      console.log(`  cd ${projectName}`);
      console.log(`  tnpm i`);
      console.log(`  tnpm start`);
    });
  });
};
