/**
 * @module helpers.validate
 */

const Model = require("../models");
const User = new Model("customer");
const Token = new Model("token");

let validate = {};

validate.verifyToken = async function (id, email) {
  return new Promise(async (resolve) => {
    try {
      const tokenData = await Token.findOne(id);
      // Check that the token is for the given user and has not expired
      if (tokenData.email === email && tokenData.expires > Date.now()) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
};

module.exports = validate;
