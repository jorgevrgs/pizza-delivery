/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("../helpers");

// Container for module (to be exported)
let lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, "/../.data/");

// Write data to a file
lib.create = function (dir, file, data) {
  // Open the file for writing
  // "w" Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
  // "wx" Like 'w' but fails if the path exists.

  return new Promise((resolve, reject) => {
    fs.open(
      path.join(lib.baseDir, dir, `${file}.json`),
      "wx",
      function (err, fileDescriptor) {
        if (err) {
          reject(err);
        } else {
          // Convert data to string
          let stringData = JSON.stringify(data);

          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData, function (err) {
            if (err) {
              reject(err);
            } else {
              fs.close(fileDescriptor, function (err) {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              });
            }
          });
        }
      }
    );
  });
};

// Read data from a file
lib.read = function (dir, file) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(lib.baseDir, dir, `${file}.json`),
      "utf8",
      function (err, data) {
        if (err) {
          reject(err);
        } else {
          const parsedData = helpers.tools.parseJsonToObject(data);
          resolve(parsedData);
        }
      }
    );
  });
};

// Update data in a file
lib.update = function (dir, file, data) {
  return new Promise((resolve, reject) => {
    // Open the file for writing
    // "r+" Open file for reading and writing. An exception occurs if the file does not exist.
    fs.open(
      path.join(lib.baseDir, dir, `${file}.json`),
      "r+",
      function (err, fileDescriptor) {
        if (err) {
          reject(err);
        } else {
          // Convert data to string
          let stringData = JSON.stringify(data);

          // Truncate the file
          fs.truncate(fileDescriptor, function (err) {
            if (err) {
              reject(err);
            } else {
              // Write to file and close it
              fs.writeFile(fileDescriptor, stringData, function (err) {
                if (err) {
                  reject(err);
                } else {
                  fs.close(fileDescriptor, function (err) {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(true);
                    }
                  });
                }
              });
            }
          });
        }
      }
    );
  });
};

// Delete a file
lib.delete = function (dir, file) {
  return new Promise((resolve, reject) => {
    // Unlink the file
    fs.unlink(path.join(lib.baseDir, dir, `${file}.json`), function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

// List all the items in a directory
lib.list = function (dir, criteria = {}) {
  return new Promise((resolve, reject) => {
    fs.readdir(lib.baseDir + dir + "/", function (err, data) {
      if (err) {
        reject(err);
      } else {
        if (data && data.length > 0) {
          let trimmedFileNames = [];
          data = data.filter((fileName) => fileName.match(/\w+.json$/g));
          data.forEach(function (fileName) {
            trimmedFileNames.push(fileName.replace(".json", ""));
          });
          resolve(trimmedFileNames);
        } else {
          resolve();
        }
      }
    });
  });
};

// Export the module
module.exports = lib;
