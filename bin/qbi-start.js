const program = require("commander");
const VisualPackage = require("./utils/VisualPackage");
const WebpackDevServer = require("webpack-dev-server");
const ConsoleWriter = require("./utils/ConsoleWriter");
const WebPackWrap = require("./utils/WebPackWrap");
const webpack = require("webpack");
// const fs = require("fs-extra");
// const path = require("path");

// let https = require("https");
// let connect = require("connect");
// let serveStatic = require("serve-static");

const options = process.argv;
program
  .option(
    "-t, --target [target]",
    "Enable babel loader to compile JS into ES5 standart"
  )
  .option("-p, --port [port]", "set the port listening on")
  .option("-m, --mute", "mute error outputs")
  .option("-d, --drop", "drop outputs into output folder");

program.parse(options);

let cwd = process.cwd();
let server;

VisualPackage.loadVisualPackage(cwd)
  .then((visualPackage) => {
    new WebPackWrap()
      .applyWebpackConfig(visualPackage, {
        devMode: true,
        generateResources: true,
        generatePbiviz: false,
        minifyJS: false,
        minify: false,
        target: typeof program.target === "undefined" ? "es5" : program.target,
        devServerPort: program.port,
      })
      .then(({ webpackConfig }) => {
        console.log(webpackConfig);
        let compiler = webpack(webpackConfig);
        ConsoleWriter.blank();
        ConsoleWriter.info("Starting server...");
        server = new WebpackDevServer(compiler, webpackConfig.devServer);
        server.listen(webpackConfig.devServer.port, () => {
          ConsoleWriter.info(
            `Server listening on port ${webpackConfig.devServer.port}`
          );
        });
      })
      .catch((e) => {
        ConsoleWriter.error(e.message);
        process.exit(1);
      });
  })
  .catch((e) => {
    ConsoleWriter.error("LOAD ERROR", e);
    process.exit(1);
  });

//clean up
function stopServer() {
  ConsoleWriter.blank();
  ConsoleWriter.info("Stopping server...");
  if (server) {
    server.close();
    server = null;
  }
}

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);
