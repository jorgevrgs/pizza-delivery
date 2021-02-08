const helpers = require("../helpers");
const Model = require("../classes/Model");
const User = new Model("customer");
const Token = new Model("token");

/**
 *
 * @param {Request} req Request class
 * @param {Response} res Response class
 */
module.exports = async function (req, res) {
  try {
    const acceptableMethods = ["post", "get", "put", "delete"];
    if (acceptableMethods.indexOf(req.method) > -1) {
      const result = await methods[req.method](req, res);
      req = result.req;
      res = result.res;
    } else {
      res.sendStatus(405);
    }
  } catch (error) {
    res.sendStatus(500);
  } finally {
    return { req, res };
  }
};

// Container for all the tokens methods
let methods = {};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
methods.post = async function (req, res) {
  try {
    const email =
      typeof req.body.email === "string" ? req.body.email.trim() : false;

    const password =
      typeof req.body.password === "string" &&
      req.body.password.trim().length > 0
        ? req.body.password.trim()
        : false;

    if (email && password) {
      // Lookup the user who matches that email number
      const id = User.generateId({ email, password });
      const user = await User.findOne(id, false);

      if (user) {
        if (helpers.password.check(password, user.password)) {
          const tokenObject = await Token.create({
            email,
            expires: Date.now() + 1000 * 60 * 60,
          });

          res.send(tokenObject);
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(400);
      }
    }
  } catch (error) {
    res.send(500, error.message);
  } finally {
    return { req, res };
  }
};

// Tokens - get
// Required data: id
// Optional data: none
methods.get = function (data, callback) {
  // Check that id is valid
  const id =
    typeof data.queryStringObject.id === "string" &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the token
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field, or field invalid" });
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
methods.put = function (req, callback) {
  const id =
    typeof req.body.id === "string" && req.body.id.trim().length === 20
      ? req.body.id.trim()
      : false;

  const extend =
    typeof req.body.extend === "boolean" && req.body.extend === true
      ? true
      : false;

  if (id && extend) {
    // Lookup the existing token
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          // Store the new updates
          _data.update("tokens", id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                Error: "Could not update the token's expiration.",
              });
            }
          });
        } else {
          callback(400, {
            Error: "The token has already expired, and cannot be extended.",
          });
        }
      } else {
        callback(400, { Error: "Specified user does not exist." });
      }
    });
  } else {
    callback(400, {
      Error: "Missing required field(s) or field(s) are invalid.",
    });
  }
};

// Tokens - delete
// Required data: id
// Optional data: none
methods.delete = function (data, callback) {
  // Check that id is valid
  const id =
    typeof data.queryStringObject.id === "string" &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the token
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // Delete the token
        _data.delete("tokens", id, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the specified token" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token." });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Verify if a given token id is currently valid for a given user
methods.verifyToken = async function (id, email) {
  return new Promise((resolve) => {
    try {
      const tokenData = _data.read("tokens", id);
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
