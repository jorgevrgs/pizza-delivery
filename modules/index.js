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
      const modules = ["helpers", "models", "middlewares", "routes"];
      const result = await helpers.files.loadModules(modules);

      // Classes
      const Model = require("../classes/Model");
      const Request = require("../classes/Request");
      const Response = require("../classes/Response");
      const Route = require("../classes/Route");

      resolve({
        ...result,
        Model,
        Request,
        Response,
        Route,
      });
    } catch (error) {
      reject(error);
    }
  });
};
