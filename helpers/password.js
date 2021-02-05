/**
 * @module helpers.password
 */

// Dependencies
const crypto = require("crypto");
const config = require("../config");

// Container for all the helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.security.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

helpers.check = function (passwordAttempt, hashedPassword) {
  return hashedPassword === helpers.hash(passwordAttempt);
};

module.exports = helpers;
