#! /usr/bin/env node
const program = require("commander");

const packageJson = require("../package.json");

program.version(packageJson.version, "-v, --version").usage("<di-cli>");

program
  .command("create <project_name>")
  .description("create a qbi component project")
  .usage("<project_name> [options]")
  .action((project_name, cmd) => {
    require("./cmd/create")(project_name);
  });
program.command("start", "Start the current project").action((md) => {
  require("./cmd/start")();
});

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}
