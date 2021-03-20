/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("../helpers");
const util = require("util");

const open = fs.promises.open;
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);

// Container for module (to be exported)
let lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, "/../.tmp/.data/");

// Write data to a file
lib.create = function (dir, file, data) {
  return new Promise(async (resolve, reject) => {
    try {
      // Open the file for writing
      // "w" Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
      // "wx" Like 'w' but fails if the path exists.
      const filehandle = await open(
        path.join(lib.baseDir, dir, `${file}.json`),
        "wx"
      );

      // Convert data to string
      let stringData = JSON.stringify(data);
      filehandle.writeFile(stringData);
      filehandle.close();

      resolve(true);
    } catch (error) {
      helpers.log.error("error.lib.create", { dir, file, data });
      helpers.log.error(util.inspect(error));
      reject(error);
    }
  });
};

// Read data from a file
lib.read = function (dir, file) {
  return new Promise(async (resolve) => {
    try {
      const data = await readFile(
        path.join(lib.baseDir, dir, `${file}.json`),
        "utf8"
      );
      const parsedData = helpers.tools.parseJsonToObject(data);

      resolve(parsedData);
    } catch (error) {
      helpers.log.verbose("error.lib.read", { dir, file });
      resolve(false);
    }
  });
};

// Update data in a file
lib.update = function (dir, file, data) {
  return new Promise(async (resolve, reject) => {
    try {
      // Open the file for writing
      // "r+" Open file for reading and writing. An exception occurs if the file does not exist.
      const filehandle = await open(
        path.join(lib.baseDir, dir, `${file}.json`),
        "r+"
      );

      // Convert data to string
      let stringData = JSON.stringify(data);

      filehandle.truncate();
      filehandle.writeFile(stringData);
      filehandle.close();

      resolve(true);
    } catch (error) {
      helpers.log.error("error.lib.update", { dir, file, data });
      reject(error);
    }
  });
};

// Delete a file
lib.delete = function (dir, file) {
  return new Promise(async (resolve, reject) => {
    // Unlink the file
    try {
      await unlink(path.join(lib.baseDir, dir, `${file}.json`));

      resolve(true);
    } catch (error) {
      helpers.log.error("error.lib.delete", { dir, file });
      reject(err);
    }
  });
};

// List all the items in a directory
lib.list = function (dir) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await readdir(path.join(lib.baseDir, dir));

      if (data && data.length > 0) {
        let trimmedFileNames = [];
        const dataFiltered = data.filter((fileName) =>
          fileName.match(/\w+.json$/g)
        );
        dataFiltered.forEach(function (fileName) {
          trimmedFileNames.push(fileName.replace(".json", ""));
        });

        resolve(trimmedFileNames);
      } else {
        resolve([]);
      }
    } catch (error) {
      helpers.log.error("error.lib.list", { dir });
      reject(error);
    }
  });
};

// Export the module
module.exports = lib;
