"use strict";

const fs = require("fs-extra");
const path = require("path");
const config = require("../../config.json");
const encoding = "utf8";
const ConsoleWriter = require("./ConsoleWriter");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

class WebPackGenerator {
  enableOptimization() {
    this.webpackConfig.mode = "production";
    this.webpackConfig.optimization = {
      concatenateModules: false,
      minimize: true,
    };
  }

  async configureDevServer(visualPackage) {
    this.webpackConfig.devServer = {
      ...this.webpackConfig.devServer,
      contentBase: path.join(visualPackage.basePath, "public"),
      ...this.customWebpackConfig.devServer,
    };
  }

  setTarget({ target = "es5", fast = false }) {
    let tsOptions = {};
    if (fast) {
      tsOptions = {
        transpileOnly: false,
        experimentalWatchApi: false,
      };
    }
    if (target === "es5") {
      let babelOptions = {
        presets: [
          [
            require.resolve("@babel/preset-env"),
            {
              targets: {
                ie: "11",
              },
              useBuiltIns: "entry",
              corejs: 3,
              modules: false,
            },
          ],
        ],
        plugins: [require.resolve("@babel/plugin-syntax-dynamic-import")],
        sourceType: "unambiguous",
        cacheDirectory: path.join(config.build.precompileFolder, "babelCache"),
      };

      this.webpackConfig.module.rules.push(
        {
          test: /(\.ts)x|\.ts$/,
          exclude: {
            test: /core-js/,
          },
          use: [
            {
              loader: require.resolve("babel-loader"),
              options: babelOptions,
            },
            {
              loader: require.resolve("ts-loader"),
              options: tsOptions,
            },
          ],
        },
        {
          test: /(\.js)x|\.js$/,
          exclude: {
            test: /core-js/,
          },
          use: [
            {
              loader: require.resolve("babel-loader"),
              options: babelOptions,
            },
          ],
        }
      );
    } else {
      this.webpackConfig.module.rules.push({
        test: /(\.ts)x?$/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: tsOptions,
          },
        ],
      });
    }
  }

  async prepareWebPackConfig(visualPackage, options, tsconfig) {
    this.webpackConfig = require("./webpack.config");
    if (options.minifyJS) {
      this.enableOptimization();
    }
    await this.configureDevServer(visualPackage);
    this.setTarget({
      target: options.target,
      fast: options.fast,
    });

    return this.webpackConfig;
  }

  async assemblyExternalJSFiles(visualPackage) {
    let externalJSFilesContent = "";
    let externalJSFilesPath = path.join(
      visualPackage.basePath,
      config.build.precompileFolder,
      "externalJS.js"
    );
    await fs.writeFile(externalJSFilesPath, externalJSFilesContent, {
      encoding: encoding,
    });

    return externalJSFilesPath;
  }

  async applyWebpackConfig(
    visualPackage,
    options = {
      devMode: false,
      generateResources: false,
      generatePbiviz: false,
      minifyJS: true,
      minify: true,
      target: "es5",
      devServerPort: 8001,
      fast: false,
      compression: 0,
    }
  ) {
    const tsconfigPath = visualPackage.buildPath("tsconfig.json");
    const tsconfig = require(tsconfigPath);
    this.webpackPath = visualPackage.buildPath("webpack.config.js");
    this.customWebpackConfig = require(this.webpackPath);
    let webpackConfig;
    webpackConfig = await this.prepareWebPackConfig(
      visualPackage,
      options,
      tsconfig
    );
    return {
      webpackConfig,
    };
  }
}

module.exports = WebPackGenerator;
