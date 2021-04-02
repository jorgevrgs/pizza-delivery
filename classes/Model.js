const Customer = require("../models/Customer");
const Food = require("../models/Food");
const Item = require("../models/Item");
const Menu = require("../models/Menu");
const Order = require("../models/Order");
const Token = require("../models/Token");

const _db = require("../database");
const helpers = require("../helpers");

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
      case "token":
        this.model = Token;
        this.plural = "tokens";
        break;
      case "order":
        this.model = Order;
        this.plural = "orders";
        break;
      default:
        throw new Error("An invalid model name was received");
    }
  }

  /**
   *
   * @param {object} data Object to be stored in database
   */
  getModelId(data) {
    if (typeof this.model.primaryKey !== "undefined") {
      if (data[this.model.primaryKey] !== "undefined") {
        return helpers.tools.utf8ToBase64(data[this.model.primaryKey]);
      } else {
        return false;
      }
    } else {
      return helpers.tools.generateId();
    }
  }

  async find(criteria = {}) {
    try {
      const data = await _db.list(this.plural, criteria);

      return data;
    } catch (error) {
      helpers.log.error(error);
      return [];
    }
  }

  async findOne(id, clean = true) {
    try {
      let data = await _db.read(this.plural, id);

      if (clean) {
        data = this.clean(data);
      }

      return data;
    } catch (error) {
      helpers.log.error("error.model.findOne", { id, clean });
      helpers.log.error(error);
      return false;
    }
  }

  async create(data, clean = true) {
    try {
      const id = this.getModelId(data);
      const obj = { ...data, id };

      if (typeof this.model.beforeCreate === "function") {
        Object.assign(obj, this.model.beforeCreate(obj));
      }

      await _db.create(this.plural, id, obj);

      let response = await this.findOne(id);

      if (clean) {
        response = this.clean(response);
      }

      return response;
    } catch (error) {
      helpers.log.error("error.model.create", { data, clean });
      helpers.log.error(error);
      return false;
    }
  }

  async update(id, data) {
    try {
      await _db.update(this.plural, id, data);

      const response = await this.findOne(id);

      return response;
    } catch (error) {
      helpers.log.error(error);
      throw new Error(error.message);
    }
  }

  async destroyOne({ id }) {
    try {
      await _db.delete(this.plural, id);

      return true;
    } catch (error) {
      helpers.log.error(error);
      return false;
    }
  }

  clean(response) {
    if (typeof this.model.beforeResponse === "function") {
      Object.assign(response, this.model.beforeResponse(response));
    }

    return response;
  }
};
