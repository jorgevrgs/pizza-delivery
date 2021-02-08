/**
 * customers handler
 */

// Dependencies
const helpers = require("../helpers");
const Model = require("../classes/Model");
const User = new Model("customer");

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

// Container for all the customers methods
let methods = {};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
methods.post = async function (req, res) {
  // @TODO: use a validator function
  // Check that all required fields are filled out
  const firstName =
    typeof req.body.firstName === "string" &&
    req.body.firstName.trim().length > 0
      ? req.body.firstName.trim()
      : false;

  const lastName =
    typeof req.body.lastName === "string" && req.body.lastName.trim().length > 0
      ? req.body.lastName.trim()
      : false;

  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : false;

  const password =
    typeof req.body.password === "string" && req.body.password.trim().length > 0
      ? req.body.password.trim()
      : false;

  const tosAgreement =
    typeof req.body.tosAgreement === "boolean" && req.body.tosAgreement === true
      ? true
      : false;

  if (firstName && lastName && email && password && tosAgreement) {
    // Make sure the user doesnt already exist
    try {
      // const hashedPassword = helpers.password.hash(password);

      const objToCreate = {
        firstName,
        lastName,
        email,
        password,
        tosAgreement: true,
      };

      const id = User.generateId(objToCreate);
      const user = await User.findOne(id);

      if (user) {
        res.sendStatus(409);
      } else {
        const createdUser = await User.create(objToCreate);

        res.send(createdUser);
      }
    } catch (error) {
      helpers.log.error(error);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }

  return { req, res };
};

// Required data: email
// Optional data: none
methods.get = async function (req, res) {
  try {
    // Check that email number is valid
    const id = typeof req.query.id === "string" ? req.query.id.trim() : false;

    if (id) {
      // Get token from headers
      const token =
        typeof req.headers.token === "string" ? req.headers.token : false;

      if (req.userId && id === req.userId) {
        const user = await User.findOne(id);

        if (user) {
          res.send(user);
        } else {
          res.sendStatus(404);
        }
      } else {
        res.sendStatus(403, {
          Error: "Missing required token in header, or token is invalid.",
        });
      }
    }
  } catch (error) {
    helpers.log.error(error);
    res.sendStatus(500);
  } finally {
    return { req, res };
  }
};

// Required data: email
// Optional data: firstName, lastName, password (at least one must be specified)
methods.put = function (req, callback) {
  // Check for required field
  const email =
    typeof req.body.email === "string" && req.body.email.trim().length === 10
      ? req.body.email.trim()
      : false;

  // Check for optional fields
  const firstName =
    typeof req.body.firstName === "string" &&
    req.body.firstName.trim().length > 0
      ? req.body.firstName.trim()
      : false;

  const lastName =
    typeof req.body.lastName === "string" && req.body.lastName.trim().length > 0
      ? req.body.lastName.trim()
      : false;

  const password =
    typeof req.body.password === "string" && req.body.password.trim().length > 0
      ? req.body.password.trim()
      : false;

  // Error if email is invalid
  if (email) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Get token from headers
      const token =
        typeof req.headers.token === "string" ? req.headers.token : false;

      // Verify that the given token is valid for the email number
      handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
        if (tokenIsValid) {
          // Lookup the user
          _data.read("customers", email, function (err, userData) {
            if (!err && userData) {
              // Update the fields if necessary
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.password.hash(password);
              }
              // Store the new updates
              _data.update("customers", email, userData, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, { Error: "Could not update the user." });
                }
              });
            } else {
              callback(403, {
                Error: "Missing required token in header, or token is invalid.",
              });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header, or token is invalid.",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update." });
    }
  } else {
    callback(400, { Error: "Missing required field." });
  }
};

// Required data: email
// Cleanup old checks associated with the user
methods.delete = function (req, callback) {
  // Check that email number is valid
  const email =
    typeof req.query.email === "string" && req.query.email.trim().length === 10
      ? req.query.email.trim()
      : false;

  if (email) {
    // Get token from headers
    const token =
      typeof req.headers.token === "string" ? req.headers.token : false;

    // Verify that the given token is valid for the email number
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read("customers", email, function (err, data) {
          if (!err && userData) {
            _data.delete("customers", email, function (err) {
              if (!err) {
                // Delete each of the checks associated with the user
                const userChecks =
                  typeof userData.checks === "object" &&
                  userData.checks instanceof Array
                    ? userData.checks
                    : [];

                const checksToDelete = userChecks.length;
                if (checksToDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  // Loop through the checks
                  userChecks.forEach(function (checkId) {
                    // Delete the check
                    _data.delete("checks", checkId, function (err) {
                      if (err) {
                        deletionErrors = true;
                      }
                      checksDeleted++;
                      if (checksDeleted === checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, {
                            Error:
                              "Errors encountered while attempting to delete all of the user's checks. All checks may not have been deleted from the system successfully.",
                          });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, { Error: "Could not delete the specified user" });
              }
            });
          } else {
            callback(400, { Error: "Could not find the specified user." });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid.",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};
