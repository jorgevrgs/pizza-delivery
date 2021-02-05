const Customer = require("./customer");
const Food = require("./food");
const Item = require("./item");
const Menu = require("./menu");
const Order = require("./order");

const _data = require("../data");
const helpers = require("../helpers/password");

module.exports = class Model {
  /**
   *
   * @param {string} model
   * @example 'Customer'
   */
  constructor(model) {
    switch (model.trim().toString()) {
      case "customer":
        this.model = Customer;
        this.plural = "customers";
        break;
      case "food":
        this.model = Food;
        this.plural = "foods";
        break;
      case "item":
        this.model = Item;
        this.plural = "items";
        break;
      case "menu":
        this.model = Menu;
        this.plural = "menus";
        break;
      case "order":
        this.model = Order;
        this.plural = "orders";
        break;
      default:
        throw new Error("An invalid model name was received");
    }
  }

  async find(criteria = {}) {
    try {
      const data = await _data.list(this.plural, criteria);

      return data;
    } catch (error) {
      helpers.log.error(error);
      return [];
    }
  }

  async findOne({ id }) {
    try {
      const data = await _data.read(this.plural, id);

      return data;
    } catch (error) {
      helpers.log.error(error);
      return {};
    }
  }

  async update({ id }, data) {
    try {
      await _data.update(this.plural, id, data);

      return true;
    } catch (error) {
      helpers.log.error(error);
      return false;
    }
  }

  async destroyOne({ id }) {
    try {
      await _data.delete(this.plural, id);

      return true;
    } catch (error) {
      helpers.log.error(error);
      return false;
    }
  }
};
