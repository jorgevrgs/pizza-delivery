/**
 * customers handler
 */

// Dependencies
const helpers = require("../helpers");
const Model = require("../models");
const User = new Model("customer");

// customers
let handlers = {};

handlers.customers = function (data, callback) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._customers[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the customers methods
handlers._customers = {};

// customers - post
// Required data: firstName, lastName, email, password, tosAgreement
// Optional data: none
handlers._customers.post = async function (req, callback) {
  helpers.log.warn(req.body);
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
    typeof req.body.email === "string" ? req.body.email.trim() : false;

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
      const user = await User.findOne(email);

      if (user) {
        callback(409, "Conflict");
      } else {
        const hashedPassword = helpers.password.hash(password);

        const createdUser = await User.create({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          tosAgreement: true,
        });

        callback(200, createdUser);
      }
    } catch (error) {
      helpers.log.error(error);
      callback(500, error);
    }
  } else {
    callback(400, "badRequest");
  }
};

// Required data: email
// Optional data: none
handlers._customers.get = function (req, callback) {
  // Check that email number is valid
  const id =
    typeof req.query.id === "string" && req.query.id.trim().length === 10
      ? req.query.id.trim()
      : false;

  if (id) {
    // Get token from headers
    const token =
      typeof req.headers.token === "string" ? data.headers.token : false;
    // Verify that the given token is valid for the email number
    handlers._tokens.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read("customers", email, function (err, data) {
          if (!err && data) {
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
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

// Required data: email
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._customers.put = function (data, callback) {
  // Check for required field
  const email =
    typeof data.body.email === "string" && data.body.email.trim().length === 10
      ? data.body.email.trim()
      : false;

  // Check for optional fields
  const firstName =
    typeof data.body.firstName === "string" &&
    data.body.firstName.trim().length > 0
      ? data.body.firstName.trim()
      : false;

  const lastName =
    typeof data.body.lastName === "string" &&
    data.body.lastName.trim().length > 0
      ? data.body.lastName.trim()
      : false;

  const password =
    typeof data.body.password === "string" &&
    data.body.password.trim().length > 0
      ? data.body.password.trim()
      : false;

  // Error if email is invalid
  if (email) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Get token from headers
      const token =
        typeof data.headers.token === "string" ? data.headers.token : false;

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
handlers._customers.delete = function (data, callback) {
  // Check that email number is valid
  const email =
    typeof data.query.email === "string" &&
    data.query.email.trim().length === 10
      ? data.query.email.trim()
      : false;

  if (email) {
    // Get token from headers
    const token =
      typeof data.headers.token === "string" ? data.headers.token : false;

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

module.exports = handlers.customers;
