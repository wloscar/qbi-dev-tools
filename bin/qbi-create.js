const fs = require("fs");
const rimraf = require("rimraf");
const child_process = require("child_process");
const chalk = require("chalk");
const inquire = require("inquirer");
const program = require("commander");
const checkArg = require("./utils/checkArg.js");
const ConsoleWriter = require("./utils/ConsoleWriter");

const options = process.argv;
program.parse(options);
const args = program.args;
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

inquire
  .prompt([
    {
      message: "Select a framework you want to work in!",
      type: "list",
      name: "Framework",
      default: "origin",
      choices: ["origin", "React"],
    },
  ])
  .then((answers) => {
    const Framework = answers.Framework;
    const branchMap = {
      origin: "demo",
      React: "react-demo",
    };

    const repo = `https://github.com/wloscar/demo-project.git`;

    ConsoleWriter.info(
      `Creating new ${Framework} project "${projectName}" now!`
    );

    const execSync = child_process.execSync;
    const cmd = `git clone --quiet --depth=1 --branch=${branchMap[Framework]} ${repo} ./${projectName}`;

    execSync(cmd);

    const projectPackage = `./${projectName}/package.json`;

    fs.readFile(projectPackage, "utf8", function (err, data) {
      if (err) {
        rimraf.sync(`./${projectName}`);
        ConsoleWriter.error(`create failed`);
        return ConsoleWriter.error(err);
      }
      ConsoleWriter.done(`create succeeded`);

      rimraf.sync(`./${projectName}/.git`);

      const json = JSON.parse(data);
      json.name = projectName;
      json.author = "Write your name here";
      json.version = "0.1.0";

      fs.writeFile(projectPackage, JSON.stringify(json, null, 2), function () {
        ConsoleWriter.done(`Project initialized successfully! Next step:`);
        ConsoleWriter.info(chalk.blue(`cd ${projectName}`));
        ConsoleWriter.info(chalk.blue(`npm i`));
        ConsoleWriter.info(chalk.blue(`npm start`));
      });
    });
  });
