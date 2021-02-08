/**
 * @module helpers.validate
 */

const Model = require("../classes/Model");
const User = new Model("customer");
const Token = new Model("token");

let validate = {};

validate.verifyToken = async function (token, userId) {
  return new Promise(async (resolve) => {
    try {
      const tokenData = await Token.findOne(token);

      const user = await User.findOne(userId);

      // Check that the token is for the given user and has not expired
      if (tokenData.email === user.email && tokenData.expires > Date.now()) {
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
