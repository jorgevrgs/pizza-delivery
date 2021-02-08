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

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
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
        res.sendStatus(403);
      }
    }
  } catch (error) {
    helpers.log.error(error);
    res.sendStatus(500);
  } finally {
    return { req, res };
  }
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
methods.put = async function (req, res) {
  try {
    if (!req.userId) {
      res.sendStatus(403);
    } else {
      // Check for required field
      const email =
        typeof req.body.email === "string" ? req.body.email.trim() : false;

      // Check for optional fields
      const firstName =
        typeof req.body.firstName === "string" &&
        req.body.firstName.trim().length > 0
          ? req.body.firstName.trim()
          : false;

      const lastName =
        typeof req.body.lastName === "string" &&
        req.body.lastName.trim().length > 0
          ? req.body.lastName.trim()
          : false;

      const password =
        typeof req.body.password === "string" &&
        req.body.password.trim().length > 0
          ? req.body.password.trim()
          : false;

      // Error if email is invalid
      if (!email || !(firstName || lastName || password)) {
        helpers.log.warn("Missing required parameters");
        res.sendStatus(400);
      } else {
        // Lookup the user
        const id = User.generateId({ email });

        const userData = await User.findOne(id);

        if (!userData) {
          res.sendStatus(404);
        } else {
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

          const updatedUser = await User.update(id, userData);

          res.send(updatedUser);
        }
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
// Cleanup old checks associated with the user
methods.delete = function (req, callback) {};
