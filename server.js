/*
 * Server-related tasks
 *
 */

// Dependencies node
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Dependencies lib
const config = require("./config");
const helpers = require("./helpers");

// Instantiate the server module object
const server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer(function (req, res) {
  server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "./https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "./https/cert.pem")),
};

server.httpsServer = https.createServer(
  server.httpsServerOptions,
  function (req, res) {
    server.unifiedServer(req, res);
  }
);

// All the server logic for both the http and https server
server.unifiedServer = async function (req, res) {
  const modules = require("./modules");
  const handlers = await modules();

  const App = require("./classes/App");
  const app = new App(req, res);

  // Define app modules
  app.setModules(handlers);

  // Parse Body
  const body = await app.request.parseBody(req);
  app.request.setBody(body);

  // @TODO: define an order and check if a payload or status code is defined
  // Run authentication
  app.middlewares.authentication(app);

  // Run middlewares
  app.middlewares.controller(app);

  // Run end
  app.middlewares.response(app);
};

// Define the request router
// server.router = handlers;

// Init script
server.init = function () {
  // Start the HTTP server
  server.httpServer.listen(config.http.port, function () {
    helpers.log.info("The HTTP server is running on port " + config.http.port);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.https.port, function () {
    helpers.log.info(
      "The HTTPS server is running on port " + config.https.port
    );
  });
};

// Export the module
module.exports = server;
