/**
 * orders handler
 */

// Dependencies
const helpers = require("../helpers");
const Model = require("../classes/Model");
const Menu = new Model("menu");

/**
 *
 * @param {Request} req Request class
 * @param {Response} res Response class
 */
module.exports = async function (req, res) {
  try {
    const acceptableMethods = ["get"];
    if (acceptableMethods.indexOf(req.method) > -1) {
      await methods[req.method](req, res);
    } else {
      res.sendStatus(405);
    }
  } catch (error) {
    helpers.log.error(error);
    res.sendStatus(500);
  }
};

// Container for all the tokens methods
let methods = {};

methods.get = async function (req, res) {
  try {
    if (req.userId) {
      const menus = await Menu.find();

      res.send(menus);
    } else {
      res.sendStatus(403);
    }
  } catch (error) {
    helpers.log.error(error);
    res.sendStatus(500);
  }
};
