let files = {};

const resolve = require("path").resolve;
const { readdir } = require("fs").promises;

files.getFiles = async function (dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );

  return Array.prototype.concat(...files);
};

module.exports = files;
