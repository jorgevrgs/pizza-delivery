let files = {};

const path = require("path");
const { readdir } = require("fs").promises;

files.getFiles = async function (dir, ext = ".js") {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );

  return Array.prototype.concat(...files);
};

files.loadModules = async function (modules) {
  let result = {};

  for (let module of modules) {
    result[module] = await this.loadModule(module);
  }

  return result;
};

files.loadModule = async function (module) {
  const folders = await this.getFiles(path.resolve(__dirname, "../", module));

  let modules = {};

  folders.forEach((folder) => {
    const basename = path.basename(folder, ".js");

    if (path.extname(path.basename(folder)) === ".js" && basename !== "index") {
      modules[basename] = require(folder);
    }
  });

  return modules;
};

module.exports = files;
