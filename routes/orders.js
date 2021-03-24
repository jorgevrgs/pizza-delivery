/**
 * orders handler
 */

// Dependencies
const helpers = require("../helpers");
const Model = require("../classes/Model");
const Order = new Model("order");

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
