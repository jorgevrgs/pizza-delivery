const StringDecoder = require("string_decoder").StringDecoder;
const { URL } = require("url");
const helpers = require("../helpers");

module.exports = class Request {
  constructor({ req }) {
    // Get the HTTP method
    this.method = req.method.toLowerCase();

    //Get the headers as an object
    this.headers = req.headers;

    // Parse the url
    const parsedUrl = new URL(
      [
        "http",
        req.connection.encrypted ? "s" : "",
        "://",
        req.headers.host,
        req.url,
      ].join("")
    );

    this.url = req.url;

    // Get the path
    const path = parsedUrl.pathname;
    this.trimmedPath = path.replace(/^\/+|\/+$/g, "");

    // Get the query string as an object
    this.query = Object.fromEntries(parsedUrl.searchParams);
    this.body = {};
  }

  getBody() {
    return this.body;
  }

  setBody(body) {
    this.body = body;
  }

  /**
   * @returns {Promise}
   */
  parseBody(req) {
    return new Promise((resolve, reject) => {
      let buffer = "";
      const decoder = new StringDecoder("utf-8");

      req.on("data", function (data) {
        buffer += decoder.write(data);
      });

      req.on("end", async function () {
        // Get the payload,if any

        buffer += decoder.end();

        resolve(helpers.tools.parseJsonToObject(buffer));
      });

      req.on("error", (e) => reject(e));
    });
  }
};
