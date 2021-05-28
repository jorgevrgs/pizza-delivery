module.exports = class Response {
  constructor() {
    this.responseType = "json";
    this.payload = "";
    this.statusCode = null;
    this.headers = {};
    this.body = "";
  }

  /**
   * Body is the parsed string response
   */
  getBody() {
    return this.body;
  }

  /**
   *
   * @param {string} body Body content
   */
  setBody(body) {
    this.body = body;
  }

  /**
   * Headers are the object containing the key value headers
   */
  getHeaders() {
    return this.headers;
  }

  /**
   *
   * @param {string} key Headers key
   * @param {string} value Headers value
   */
  setHeaders(key, value) {
    this.headers[key] = value;
  }

  /**
   * Original body content
   */
  getPayload() {
    return this.payload;
  }

  /**
   *
   * @param {ref} payload
   */
  setPayload(payload) {
    this.payload = payload;
  }

  /**
   * Response type to use with `this.send()`
   */
  getResponseType() {
    return this.responseType;
  }

  /**
   *
   * @param {ref} responseType
   */
  setResponseType(responseType) {
    this.responseType = responseType;
  }

  /**
   * Status code to use with `res.writeHead(statusCode)`
   */
  getStatusCode() {
    return this.statusCode;
  }

  /**
   *
   * @param {ref} statusCode
   */
  setStatusCode(statusCode) {
    this.statusCode = statusCode;
  }

  /**
   * Function to finish the response call
   *
   * @example:
   * ``` js
   * response.setStatusCode(200);
   * response.send({"foo": "bar"});
   * ```
   */
  send(payload) {
    if (!this.getStatusCode()) {
      this.setStatusCode(200);
    }

    this.setPayload(payload);

    if (this.getResponseType() === "json") {
      this.json();
    } else {
      this.setBody(this.getPayload());
    }
  }

  /**
   * Set Json headers and body
   */
  json() {
    this.setHeaders("Content-Type", "application/json");
    this.setBody(JSON.stringify(this.getPayload()));
  }

  /**
   *
   * @param {number} code
   */
  sendStatus(code) {
    switch (code) {
      // 2xx success
      case 200:
        this.setStatusCode(200);
        this.setPayload("OK");
        break;
      case 201:
        this.setStatusCode(201);
        this.setPayload("Created");
        break;
      case 204:
        this.setStatusCode(204);
        this.setPayload("No Content");
        break;
      // 4xx client errors
      case 400:
        this.setStatusCode(400);
        this.setPayload("Bad Request");
        break;
      case 401:
        this.setStatusCode(401);
        this.setPayload("Unauthorized");
        break;
      case 403:
        this.setStatusCode(403);
        this.setPayload("Forbidden");
        break;
      case 404:
        this.setStatusCode(404);
        this.setPayload("Not Found");
        break;
      case 405:
        this.setStatusCode(405);
        this.setPayload("Method Not Allowed");
        break;
      case 409:
        this.setStatusCode(409);
        this.setPayload("Conflict");
        break;
      case 429:
        this.setStatusCode(429);
        this.setPayload("Too Many Requests ");
        break;
      case 500:
        this.setStatusCode(500);
        this.setPayload("Internal Server Error");
        break;
      default:
        this.setStatusCode(code);
        this.setPayload(code);
    }
  }
};
