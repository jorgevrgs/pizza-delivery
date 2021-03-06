const helpers = require("../helpers");
const Model = require("../classes/Model");
const helper = require("../helpers/request");
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
      await methods[req.method](req, res);
    } else {
      res.sendStatus(405);
    }
  } catch (error) {
    helpers.log.error(error);
    res.internalServerError(error.message);
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
      const id = User.getModelId({ email, password });
      const user = await User.findOne(id, false);

      if (user) {
        if (helpers.password.check(password, user.password)) {
          const tokenObject = await Token.create({
            email,
            expires: Date.now() + 1000 * 60 * 60,
          });

          let tokenString = `${user.id}.${tokenObject.id}.`;
          tokenString += helpers.password.hash(tokenString);

          res.send({ token: tokenString });
        } else {
          res.unauthorized("Wrong user or password");
        }
      } else {
        res.unauthorized("Wrong user or password");
      }
    }
  } catch (error) {
    helpers.log.error(error);
    res.internalServerError(error.message);
  }
};

// Tokens - get
// Required data: id
// Optional data: none
methods.get = async function (req, res) {
  try {
    const token =
      typeof req.query.id === "string" ? req.query.id.trim() : false;

    if (token) {
      // Extract the token Id from the token query string
      const tokenArray = token.split(".");
      const tokenId = tokenArray[1];

      if (tokenId) {
        // Find token data from database
        const response = await Token.findOne(tokenId);

        if (response) {
          res.send(response);
        } else {
          res.notFound("Token not found");
        }
      } else {
        res.badRequest("Wrong token value");
      }
    } else {
      res.badRequest("Missing required param");
    }
  } catch (error) {
    helpers.log.error(error);
    res.internalServerError(error.message);
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
methods.put = async function (req, res) {
  const id =
    typeof req.body.id === "string" && req.body.id.trim().length === 20
      ? req.body.id.trim()
      : false;

  const extend =
    typeof req.body.extend === "boolean" && req.body.extend === true
      ? true
      : false;

  if (id && extend) {
    try {
      // Lookup the existing token
      const tokenData = await Token.findOne(id);

      if (tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          await Token.update(id, tokenData);
          res.success();
        } else {
          res.forbidden("Token expired");
        }
      } else {
        res.notFound("Token not found");
      }
    } catch (error) {
      helpers.log.error(error);
      res.internalServerError(error.message);
    }
  } else {
    res.badRequest("Missing required params");
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
