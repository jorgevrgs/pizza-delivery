/*
 * Server-related tasks
 *
 */

// Dependencies node
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const fs = require("fs");
const path = require("path");

// Dependencies lib
const config = require("./config");
const handlers = require("./handlers");
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
server.unifiedServer = function (req, res) {
  // Parse the url
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get the query string as an object
  const query = parsedUrl.query;

  // Get the HTTP method
  const method = req.method.toLowerCase();

  //Get the headers as an object
  const headers = req.headers;

  // Get the payload,if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", function (data) {
    buffer += decoder.write(data);
  });

  req.on("end", async function () {
    buffer += decoder.end();

    const router = await server.router;

    // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : router.notFound;

    // Construct the data object to send to the handler
    const request = {
      trimmedPath: trimmedPath,
      query,
      method,
      headers,
      body: helpers.tools.parseJsonToObject(buffer),
    };

    // Route the request to the handler specified in the router
    chosenHandler(request, function (statusCode, payload) {
      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof payload === "object" ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      // If the response is 200, print green, otherwise print red
      if (statusCode === 200) {
        helpers.log.debug(
          "server",
          method.toUpperCase() + " /" + trimmedPath + " " + statusCode
        );
      } else {
        helpers.log.debug(
          "server",
          method.toUpperCase() + " /" + trimmedPath + " " + statusCode
        );
      }
    });
  });
};

// Define the request router
server.router = handlers;

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
