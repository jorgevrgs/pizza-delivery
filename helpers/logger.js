/*
 * Library for storing and rotating logs
 *
 */

// Dependencies
const fs = require("fs");
const util = require("util");
const path = require("path");
const zlib = require("zlib");

const open = util.promisify(fs.open);
const appendFile = util.promisify(fs.appendFile);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const truncate = util.promisify(fs.truncate);
const readdir = util.promisify(fs.readdir);
const close = util.promisify(fs.close);

const gzip = util.promisify(zlib.gzip);
const unzip = util.promisify(zlib.unzip);

const helpers = require("../helpers");

// Container for module (to be exported)
const lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname, "/../.tmp/.logs/");

// Append a string to a file. Create the file if it does not exist
lib.append = function (file, str) {
  return new Promise(async (resolve, reject) => {
    try {
      const fileDescriptor = await open(
        path.join(lib.baseDir, `${file}.log`),
        "a"
      );
      await appendFile(fileDescriptor, "${str} \n");
      await close(fileDescriptor);

      resolve(true);
    } catch (error) {
      helpers.log.error("error.helpers.logger.append", { file, str });
      reject(error);
    }
  });
};

// List all the logs, and optionally include the compressed logs
lib.list = function (includeCompressedLogs = false) {
  return new Promise(async (resolve, reject) => {
    try {
      let data = await readdir(lib.baseDir);

      data = data.filter((fileName) => fileName.match(/\w+.log$/g));
      let trimmedFileNames = [];

      data.forEach(function (fileName) {
        // Add the .log files
        if (fileName.indexOf(".log") > -1) {
          trimmedFileNames.push(fileName.replace(".log", ""));
        }

        // Add the .gz files
        if (fileName.indexOf(".gz.b64") > -1 && includeCompressedLogs) {
          trimmedFileNames.push(fileName.replace(".gz.b64", ""));
        }

        resolve(trimmedFileNames);
      });
    } catch (error) {
      helpers.log.error("error.helpers.logger.list", { includeCompressedLogs });
      reject(error);
    }
  });
};

// Compress the contents of one .log file into a .gz.b64 file within the same directory
lib.compress = function (logId, newFileId) {
  return new Promise(async (resolve, reject) => {
    try {
      const sourceFile = logId + ".log";
      const destFile = newFileId + ".gz.b64";

      // Read the source file
      const inputString = await readFile(
        path.join(lib.baseDir, sourceFile),
        "utf8"
      );

      // Compress the data using gzip
      const buffer = await gzip(inputString);

      // Send the data to the destination file
      const fileDescriptor = await open(path.join(lib.baseDir, destFile), "wx");

      // Write to the destination file
      await writeFile(fileDescriptor, buffer.toString("base64"));

      // Close the destination file
      await close(fileDescriptor);

      resolve(true);
    } catch (error) {
      helpers.log.error("error.helpers.logger.compress", {
        includeCompressedLogs,
      });
      reject(error);
    }
  });
};

// Decompress the contents of a .gz file into a string const iable
lib.decompress = function (fileId) {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = fileId + ".gz.b64";

      const str = await readFile(path.join(lib.baseDir, fileName), "utf8");

      // Inflate the data
      const inputBuffer = Buffer.from(str, "base64");
      const outputBuffer = await unzip(inputBuffer);
      const response = outputBuffer.toString();

      resolve(response);
    } catch (error) {
      helpers.log.error("error.helpers.logger.decompress", { fileId });
      reject(error);
    }
  });
};

// Truncate a log file
lib.truncate = function (logId) {
  return new Promise(async (resolve, reject) => {
    try {
      await truncate(path.join(lib.baseDir, `${logId}.log`), 0);

      resolve(true);
    } catch (error) {
      helpers.log.error("error.helpers.logger.truncate", { fileId });
      reject(error);
    }
  });
};

// Export the module
module.exports = lib;
