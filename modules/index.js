/**
 * Request Handlers
 */

const helpers = require("../helpers");

// Define all the handlers
let routes = {};

// Ping
routes.ping = function (req, res) {
  res.send({
    method: req.method,
    body: req.getBody(),
  });
};

// Not-Found
routes.notFound = function (_req, res) {
  res.sendStatus(404);
};

routes.clientError = function (_req, res) {
  res.sendStatus(res.getStatusCode());
};

/**
 * @returns {Promise}
 */
module.exports = function () {
  return new Promise(async (resolve, reject) => {
    try {
      // Helpers
      const helperModules = await helpers.files.loadModules("helpers");

      // Models
      const models = require("../models");

      const userRoutes = await helpers.files.loadModules("routes");
      Object.assign(routes, userRoutes);

      // Middlewares
      const middlewares = await helpers.files.loadModules("middlewares");

      // Classes
      const Model = require("../classes/Model");
      const Request = require("../classes/Request");
      const Response = require("../classes/Response");

      resolve({
        helpers: helperModules,
        middlewares,
        models,
        routes,
        Model,
        Request,
        Response,
      });
    } catch (error) {
      reject(error);
    }
  });
};
