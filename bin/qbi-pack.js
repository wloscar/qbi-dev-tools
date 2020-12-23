const fs = require("fs");
const child_process = require("child_process");
const checkArg = require("./utils/checkArg.js");
const ConsoleWriter = require("./utils/ConsoleWriter");
const archiver = require("archiver");
const path = require("path");

const cwd = process.cwd();
const options = process.argv;

// 打包文件
const files = [
  path.resolve(cwd, "./build/main.js"),
  path.resolve(cwd, "./build/meta.js"),
  path.resolve(cwd, "./build/main.css"),
  path.resolve(cwd, "./package.json"),
];

ConsoleWriter.info("packing...");

let packageJson;

try {
  packageJson = JSON.parse(
    fs.readFileSync(path.resolve(cwd, "./package.json"), "utf8")
  );
} catch (err) {
  ConsoleWriter.error(err);
}

const outputFileName = packageJson
  ? `${packageJson.name || ""}-${packageJson.version || ""}.zip`
  : "./component.zip";

const output = fs.createWriteStream(path.resolve(cwd, "build", outputFileName));
const archive = archiver("zip");

output.on("close", function () {
  ConsoleWriter.info(archive.pointer() + " total bytes");
  ConsoleWriter.info("pack finish.");
});

archive.on("error", function (err) {
  ConsoleWriter.error(err);
  throw err;
});

archive.pipe(output);

files
  .reduce(
    (prev, file) =>
      prev.append(fs.createReadStream(file), { name: path.basename(file) }),
    archive
  )
  .finalize();
