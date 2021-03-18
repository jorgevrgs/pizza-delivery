/**
 * Request Handlers
 */

const helpers = require("../helpers");

/**
 * @returns {Promise}
 */
module.exports = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const modules = ["classes", "helpers", "models", "middlewares", "routes"];
      const result = await helpers.files.loadModules(modules);

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
