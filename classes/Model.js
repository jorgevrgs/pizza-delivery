const Customer = require("../models/Customer");
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
        break;
      case "item":
        this.model = Item;
        break;
      case "menu":
        this.model = Menu;
        break;
      case "token":
        this.model = Token;
        break;
      case "order":
        this.model = Order;
        break;
      default:
        throw new Error("An invalid model name was received");
    }

    this.tableName = this.model.tableName;
    this.attributes = this.model.attributes;
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
      const data = await _db.list(this.tableName, criteria);

      return data;
    } catch (error) {
      helpers.log.error(error);
      return [];
    }
  }

  async findOne(id, cleanBeforeResponse = true) {
    try {
      let data = await _db.read(this.tableName, id);

      if (cleanBeforeResponse) {
        data = this.cleanBeforeResponse(data);
      }

      return data;
    } catch (error) {
      helpers.log.error("error.model.findOne", { id, cleanBeforeResponse });
      helpers.log.error(error);
      return false;
    }
  }

  async createEach(params) {
    return new Promise(async (resolve, reject) => {
      try {
        let toCreatePromises = [];
        for (let param of params) {
          toCreatePromises.push(this.create(param));
        }

        await Promise.all(toCreatePromises);

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  async create(data, cleanBeforeResponse = true) {
    try {
      const id = this.getModelId(data);
      const obj = { ...data, id };

      if (typeof this.model.beforeCreate === "function") {
        Object.assign(obj, this.model.beforeCreate(obj));
      }

      await _db.create(this.tableName, id, obj);

      let response = await this.findOne(id);

      if (cleanBeforeResponse) {
        response = this.cleanBeforeResponse(response);
      }

      return response;
    } catch (error) {
      console.log(helpers.log);
      helpers.log.error("error.model.create", { data, cleanBeforeResponse });
      helpers.log.error(error);
      return false;
    }
  }

  async update(id, data) {
    try {
      await _db.update(this.tableName, id, data);

      const response = await this.findOne(id);

      return response;
    } catch (error) {
      helpers.log.error(error);
      throw new Error(error.message);
    }
  }

  async destroyOne({ id }) {
    try {
      await _db.delete(this.tableName, id);

      return true;
    } catch (error) {
      helpers.log.error(error);
      return false;
    }
  }

  cleanBeforeResponse(response) {
    if (typeof this.model.beforeResponse === "function") {
      Object.assign(response, this.model.beforeResponse(response));
    }

    return response;
  }

  hasMissingOrInvalidParams(body) {
    const keys = Object.keys(this.attributes);

    let missingOrInvalidFields = [];

    keys.forEach((key) => {
      // If it's required should be present
      const fieldIsRequired =
        typeof this.attributes[key].required !== "undefined" &&
        true === this.attributes[key].required;

      if (fieldIsRequired) {
        // If it's required and it's validate function should be valid
        const fieldRequireValidation =
          typeof this.attributes[key].validate !== "undefined" &&
          typeof this.attributes[key].validate === "function";

        if (
          (fieldRequireValidation &&
            !this.attributes[key].validate(body[key])) ||
          !body[key]
        ) {
          missingOrInvalidFields.push(key);
        }
      }
    });

    return missingOrInvalidFields;
  }
};
