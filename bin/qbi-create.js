const fs = require("fs");
const rimraf = require("rimraf");
const child_process = require("child_process");
const chalk = require("chalk");
const checkArg = require("./utils/checkArg.js");
const program = require("commander");
const ConsoleWriter = require("./utils/ConsoleWriter");

const options = process.argv;

// program
//     .option('-f, --force', 'force creation (overwrites folder if exists)')
//     .option('-t, --template [template]', 'use a specific template (default, table, slicer, rvisual, rhtml)')
//     .option('--api-version [version]', 'use a specific api version (1.0.0, 1.1.0, 1.2.0, ...)');

program.parse(options);
const args = program.args;
console.log(args);
if (!args || args.length < 1) {
  ConsoleWriter.error("You must enter a component name");
  process.exit(1);
}
const projectName = args[0];

checkArg(
  projectName.match(/^[a-z][a-z0-9_-]+$/),
  `The project must start with a letter and can only contain these symbols: a-z, 0-9, -, _`
);

checkArg(
  !fs.existsSync(`./${projectName}`),
  `File or folder "./${projectName}" already exists`
);

const repo = `https://github.com/wloscar/demo-project.git`;

console.log(`Creating new project "${projectName}" now!`);

const execSync = child_process.execSync;
const cmd = `git clone --quiet --depth=1 --branch=react-demo ${repo} ./${projectName}`;

execSync(cmd);

const projectPackage = `./${projectName}/package.json`;

fs.readFile(projectPackage, "utf8", function (err, data) {
  if (err) {
    rimraf.sync(`./${projectName}`);
    console.log(chalk.red("  create failed"));
    return console.log(err);
  }
  console.log(chalk.green("  create succeeded"));

  rimraf.sync(`./${projectName}/.git`);

  const json = JSON.parse(data);
  json.name = projectName;
  json.author = "Write your name here";
  json.version = "0.1.0";

  // 替换打包文件名为项目名称
  json.scripts.zip = json.scripts.zip.replace("component", projectName);

  fs.writeFile(projectPackage, JSON.stringify(json, null, 2), function () {
    console.log("");
    console.log(chalk.green(`Project initialized successfully! Next step:`));
    console.log(chalk.blue(`  cd ${projectName}`));
    console.log(chalk.blue(`  npm i`));
    console.log(chalk.blue(`  npm start`));
  });
});
