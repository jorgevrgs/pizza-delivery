/**
 * customers handler
 */

// Dependencies
const helpers = require("../helpers");
const Model = require("../classes/Model");
const helper = require("../helpers/request");
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
      await methods[req.method](req, res);
    } else {
      res.sendStatus(405);
    }
  } catch (error) {
    helper.log.error(error);
    res.sendStatus(500);
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
  // Check that all required fields are filled out
  const missingOrInvalidFields = User.hasMissingOrInvalidParams(req.body);

  if (!missingOrInvalidFields.length) {
    // Make sure the user doesnt already exist
    try {
      const objToCreate = req.body;

      const id = User.getModelId(objToCreate);
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
    helpers.log.error(`Missing fields ${missingOrInvalidFields.toString()}`);
    res.sendStatus(400);
  }
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
      // User is authenticated
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
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    helpers.log.error(error);
    res.sendStatus(500);
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
        const id = User.getModelId({ email });

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
  }
};

// Required data: email
// Cleanup old checks associated with the user
methods.delete = async function (req, res) {
  // Check that email number is valid
  const id = typeof req.query.id === "string" ? req.query.id.trim() : false;

  if (id) {
    if (req.userId && id === req.userId) {
      await User.destroyOne({ id });

      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};
