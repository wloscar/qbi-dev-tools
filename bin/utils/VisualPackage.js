let fs = require("fs-extra");
let path = require("path");
// let VisualGenerator = require("../lib/VisualGenerator");
let childProcess = require("child_process");
// let ConsoleWriter = require("./ConsoleWriter");

const CONFIG_FILE = "webpack.config.json";

/**
 * Represents an instance of a visual package based on file path
 */
class VisualPackage {
  /**
   * Creates a new visual package
   *
   * @param {string} rootPath - file path to root of visual package
   * @param {string} visualName - name of the visual to create in the rootPath
   * @param {object} generateOptions - options for the visual generator
   * <VisualPackage>} - instance of newly created visual package
   */
  //   static createVisualPackage(rootPath, visualName, generateOptions) {
  //     return VisualGenerator.generate(rootPath, visualName, generateOptions)
  //       .then((visualPath) =>
  //         VisualPackage.installPackages(visualPath).then(() => visualPath)
  //       )
  //       .then((visualPath) => VisualPackage.loadVisualPackage(visualPath));
  //   }

  /**
   * Loads an instance of a visual package from a file path
   *
   * @param {string} rootPath - file path to root of visual package
   * @returns {Promise<VisualPackage>} - instance of newly created visual package
   */
  static loadVisualPackage(rootPath) {
    return new Promise((resolve, reject) => {
      try {
        resolve(new VisualPackage(rootPath));
      } catch (e) {
        if (e && e.code && e.code === "ENOENT") {
          return reject(
            new Error(
              CONFIG_FILE +
                " not found. You must be in the root of a visual project to run this command."
            )
          );
        }
        reject(e);
      }
    });
  }

  /**
   * Install npm dependencies for visual
   * @param {string} rootPath - file path to root of visual package
   * @static
   * @returns {Promise<void>}
   * @memberof VisualPackage
   */
  //   static installPackages(visualPath) {
  //     return new Promise(function (resolve, reject) {
  //       ConsoleWriter.info("Installing packages...");
  //       childProcess.exec(`npm install`, { cwd: visualPath }, (err) => {
  //         if (err) {
  //           reject(new Error("Package install failed."));
  //         } else {
  //           ConsoleWriter.info("Installed packages.");
  //           resolve();
  //         }
  //       });
  //     });
  //   }

  /**
   * 可视化包的构造方法
   * @param {*} rootPath
   */
  constructor(rootPath) {
    this.basePath = rootPath;
    // this.config = fs.readJsonSync(this.buildPath(CONFIG_FILE));
  }

  /**
   * 构建路径
   */
  buildPath() {
    return path.join.apply(this, [this.basePath].concat(Array.from(arguments)));
  }
}

module.exports = VisualPackage;
