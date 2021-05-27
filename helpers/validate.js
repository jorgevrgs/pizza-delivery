/**
 * @module helpers.validate
 */

let validate = {};

validate.verifyToken = async function (token, userId) {
  const Model = require("../classes/Model");
  const User = new Model("customer");
  const Token = new Model("token");

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

validate.isValidBody = function (Model, body) {
  const keys = Object.keys(Model.attributes);

  let missingOrInvalidFields = [];

  keys.forEach((key) => {
    // If it's required should be present
    const fieldIsRequired =
      typeof Model.attributes[key].required !== "undefined" &&
      true === Model.attributes[key].required;

    if (fieldIsRequired) {
      // If it's required and it's validate function should be valid
      const fieldRequireValidation =
        typeof Model.attributes[key].validate !== "undefined" &&
        typeof Model.attributes[key].validate === "function";

      if (
        (fieldRequireValidation &&
          !Model.attributes[key].validate(body[key])) ||
        !body[key]
      ) {
        missingOrInvalidFields.push(key);
      }
    }
  });

  return missingOrInvalidFields;
};

module.exports = validate;
