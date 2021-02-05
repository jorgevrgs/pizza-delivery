/**
 * Request Handlers
 */

const path = require("path");
const helpers = require("../helpers");

// Define all the handlers
let handlers = {};

// Ping
handlers.ping = function (_data, callback) {
  callback(200);
};

// Not-Found
handlers.notFound = function (_data, callback) {
  callback(404);
};

async function getRoutes() {
  const folders = await helpers.files.getFiles(
    path.resolve(__dirname, "../", "routes")
  );

  let routes = {};

  folders.forEach((folder) => {
    const basename = path.basename(folder, ".js");
    routes[basename] = require(folder);
  });

  return routes;
}

module.exports = new Promise(async (resolve, reject) => {
  try {
    const userRoutes = await getRoutes();
    Object.assign(handlers, { ...userRoutes });
    resolve(handlers);
  } catch (error) {
    reject(error);
  }
});
