let handlers = {};

// Checks
handlers.checks = function (data, callback) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the checks methods
handlers._checks = {};

// Checks - post
// Required data: protocol,url,method,successCodes,timeoutSeconds
// Optional data: none
handlers._checks.post = function (req, callback) {
  // Validate inputs
  const protocol =
    typeof req.body.protocol === "string" &&
    ["https", "http"].indexOf(req.body.protocol) > -1
      ? req.body.protocol
      : false;
  const url =
    typeof req.body.url === "string" && req.body.url.trim().length > 0
      ? req.body.url.trim()
      : false;
  const method =
    typeof req.body.method === "string" &&
    ["post", "get", "put", "delete"].indexOf(req.body.method) > -1
      ? req.body.method
      : false;
  const successCodes =
    typeof req.body.successCodes === "object" &&
    req.body.successCodes instanceof Array &&
    req.body.successCodes.length > 0
      ? req.body.successCodes
      : false;
  const timeoutSeconds =
    typeof req.body.timeoutSeconds === "number" &&
    req.body.timeoutSeconds % 1 === 0 &&
    req.body.timeoutSeconds >= 1 &&
    req.body.timeoutSeconds <= 5
      ? req.body.timeoutSeconds
      : false;
  if (protocol && url && method && successCodes && timeoutSeconds) {
    // Get token from headers
    const token =
      typeof req.headers.token === "string" ? req.headers.token : false;

    // Lookup the user phone by reading the token
    _data.read("tokens", token, function (err, tokenData) {
      if (!err && tokenData) {
        const userPhone = tokenData.phone;

        // Lookup the user data
        _data.read("users", userPhone, function (err, userData) {
          if (!err && userData) {
            const userChecks =
              typeof userData.checks === "object" &&
              userData.checks instanceof Array
                ? userData.checks
                : [];
            // Verify that user has less than the number of max-checks per user
            if (userChecks.length < config.maxChecks) {
              // Create random id for check
              const checkId = helpers.createRandomString(20);

              // Create check object including userPhone
              const checkObject = {
                id: checkId,
                userPhone,
                protocol,
                url,
                method,
                successCodes,
                timeoutSeconds,
              };

              // Save the object
              _data.create("checks", checkId, checkObject, function (err) {
                if (!err) {
                  // Add check id to the user's object
                  userData.checks = userChecks;
                  userData.checks.push(checkId);

                  // Save the new user data
                  _data.update("users", userPhone, userData, function (err) {
                    if (!err) {
                      // Return the data about the new check
                      callback(200, checkObject);
                    } else {
                      callback(500, {
                        Error: "Could not update the user with the new check.",
                      });
                    }
                  });
                } else {
                  callback(500, { Error: "Could not create the new check" });
                }
              });
            } else {
              callback(400, {
                Error:
                  "The user already has the maximum number of checks (" +
                  config.maxChecks +
                  ").",
              });
            }
          } else {
            callback(403);
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, { Error: "Missing required inputs, or inputs are invalid" });
  }
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = function (req, callback) {
  // Check that id is valid
  const id =
    typeof req.query.id === "string" && req.query.id.trim().length === 20
      ? req.query.id.trim()
      : false;
  if (id) {
    // Lookup the check
    _data.read("checks", id, function (err, checkData) {
      if (!err && checkData) {
        // Get the token that sent the request
        const token =
          typeof req.headers.token === "string" ? req.headers.token : false;
        // Verify that the given token is valid and belongs to the user who created the check
        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          function (tokenIsValid) {
            if (tokenIsValid) {
              // Return check data
              callback(200, checkData);
            } else {
              callback(403);
            }
          }
        );
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field, or field invalid" });
  }
};

// Checks - put
// Required data: id
// Optional data: protocol,url,method,successCodes,timeoutSeconds (one must be sent)
handlers._checks.put = function (req, callback) {
  // Check for required field
  const id =
    typeof req.body.id === "string" && req.body.id.trim().length === 20
      ? req.body.id.trim()
      : false;

  // Check for optional fields
  const protocol =
    typeof req.body.protocol === "string" &&
    ["https", "http"].indexOf(req.body.protocol) > -1
      ? req.body.protocol
      : false;
  const url =
    typeof req.body.url === "string" && req.body.url.trim().length > 0
      ? req.body.url.trim()
      : false;
  const method =
    typeof req.body.method === "string" &&
    ["post", "get", "put", "delete"].indexOf(req.body.method) > -1
      ? req.body.method
      : false;
  const successCodes =
    typeof req.body.successCodes === "object" &&
    req.body.successCodes instanceof Array &&
    req.body.successCodes.length > 0
      ? req.body.successCodes
      : false;
  const timeoutSeconds =
    typeof req.body.timeoutSeconds === "number" &&
    req.body.timeoutSeconds % 1 === 0 &&
    req.body.timeoutSeconds >= 1 &&
    req.body.timeoutSeconds <= 5
      ? req.body.timeoutSeconds
      : false;

  // Error if id is invalid
  if (id) {
    // Error if nothing is sent to update
    if (protocol || url || method || successCodes || timeoutSeconds) {
      // Lookup the check
      _data.read("checks", id, function (err, checkData) {
        if (!err && checkData) {
          // Get the token that sent the request
          const token =
            typeof req.headers.token === "string" ? req.headers.token : false;
          // Verify that the given token is valid and belongs to the user who created the check
          handlers._tokens.verifyToken(
            token,
            checkData.userPhone,
            function (tokenIsValid) {
              if (tokenIsValid) {
                // Update check data where necessary
                if (protocol) {
                  checkData.protocol = protocol;
                }
                if (url) {
                  checkData.url = url;
                }
                if (method) {
                  checkData.method = method;
                }
                if (successCodes) {
                  checkData.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkData.timeoutSeconds = timeoutSeconds;
                }

                // Store the new updates
                _data.update("checks", id, checkData, function (err) {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, { Error: "Could not update the check." });
                  }
                });
              } else {
                callback(403);
              }
            }
          );
        } else {
          callback(400, { Error: "Check ID did not exist." });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update." });
    }
  } else {
    callback(400, { Error: "Missing required field." });
  }
};

// Checks - delete
// Required data: id
// Optional data: none
handlers._checks.delete = function (req, callback) {
  // Check that id is valid
  const id =
    typeof req.query.id === "string" && req.query.id.trim().length === 20
      ? req.query.id.trim()
      : false;
  if (id) {
    // Lookup the check
    _data.read("checks", id, function (err, checkData) {
      if (!err && checkData) {
        // Get the token that sent the request
        const token =
          typeof req.headers.token === "string" ? req.headers.token : false;
        // Verify that the given token is valid and belongs to the user who created the check
        handlers._tokens.verifyToken(
          token,
          checkData.userPhone,
          function (tokenIsValid) {
            if (tokenIsValid) {
              // Delete the check data
              _data.delete("checks", id, function (err) {
                if (!err) {
                  // Lookup the user's object to get all their checks
                  _data.read(
                    "users",
                    checkData.userPhone,
                    function (err, userData) {
                      if (!err) {
                        const userChecks =
                          typeof userData.checks === "object" &&
                          userData.checks instanceof Array
                            ? userData.checks
                            : [];

                        // Remove the deleted check from their list of checks
                        const checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          // Re-save the user's data
                          userData.checks = userChecks;
                          _data.update(
                            "users",
                            checkData.userPhone,
                            userData,
                            function (err) {
                              if (!err) {
                                callback(200);
                              } else {
                                callback(500, {
                                  Error: "Could not update the user.",
                                });
                              }
                            }
                          );
                        } else {
                          callback(500, {
                            Error:
                              "Could not find the check on the user's object, so could not remove it.",
                          });
                        }
                      } else {
                        callback(500, {
                          Error:
                            "Could not find the user who created the check, so could not remove the check from the list of checks on their user object.",
                        });
                      }
                    }
                  );
                } else {
                  callback(500, { Error: "Could not delete the check data." });
                }
              });
            } else {
              callback(403);
            }
          }
        );
      } else {
        callback(400, { Error: "The check ID specified could not be found" });
      }
    });
  } else {
    callback(400, { Error: "Missing valid id" });
  }
};

module.exports = handlers.checks;
