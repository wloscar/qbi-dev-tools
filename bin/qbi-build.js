"use strict";

let program = require("commander");
let VisualPackage = require("./utils/VisualPackage");
let ConsoleWriter = require("./utils/ConsoleWriter");
let WebPackWrap = require("./utils/WebPackWrap");
const webpack = require("webpack");
let options = process.argv;

program.option(
  "-t, --target [target]",
  "Enable babel loader to compile JS into ES5 standart",
  "es5"
);

program.parse(options);

let cwd = process.cwd();

VisualPackage.loadVisualPackage(cwd)
  .then((visualPackage) => {
    ConsoleWriter.info("Building visual...");

    new WebPackWrap()
      .applyWebpackConfig(visualPackage, {
        devMode: false,
        target: program.target,
        minifyJS: true,
        minify: true,
      })
      .then(({ webpackConfig }) => {
        let compiler = webpack(webpackConfig);
        compiler.run(function (err, stats) {
          console.log(err, stats);
          if (err) {
            ConsoleWriter.error(
              `Package wasn't created. ${JSON.stringify(err)}`
            );
          }
          if (stats.compilation.errors.length) {
            ConsoleWriter.error(
              `Package wasn't created. ${stats.compilation.errors.length} errors found`
            );
          }
          process.exit(0);
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
