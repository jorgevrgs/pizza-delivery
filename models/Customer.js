const helpers = require("../helpers");

module.exports = {
  tableName: "customers",
  primaryKey: "email",
  attributes: {
    firstName: {
      type: "string",
      required: true,
      example: "John",
      validate: (firstName) => {
        return firstName.trim().length > 0;
      },
    },
    lastName: {
      type: "string",
      required: true,
      example: "Doe",
      validate: (lastName) => {
        return lastName.trim().length > 0;
      },
    },
    email: {
      type: "string",
      required: true,
      example: "user@example.com",
      validate: (email) => {
        if (typeof email !== "string") {
          return false;
        }
        // @see https://www.w3resource.com/javascript/form/email-validation.php
        const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        return email.trim().length > 0 && re.test(email.toLowerCase());
      },
    },
    password: {
      type: "string",
      required: true,
      protected: true,
      validate: (password) => {
        return password.trim().length > 0;
      },
    },
  },
  beforeCreate(data) {
    if (typeof data.password !== "undefined") {
      data.password = helpers.password.hash(data.password);
    }

    if (typeof data.firstName === "string") {
      data.firstName = data.firstName.trim();
    }

    if (typeof data.lastName === "string") {
      data.lastName = data.lastName.trim();
    }

    if (typeof data.email === "string") {
      data.email = data.email.toLowerCase();
    }

    return data;
  },
  beforeUpdate(data) {
    if (typeof data.password !== "undefined") {
      data.password = helpers.password.hash(data.password);
    }

    if (typeof data.email === "string") {
      data.email = data.email.toLowerCase();
    }

    if (typeof data.firstName === "string") {
      data.firstName = data.firstName.trim();
    }

    if (typeof data.lastName === "string") {
      data.lastName = data.lastName.trim();
    }

    return data;
  },
  beforeResponse(data) {
    const keys = Object.keys(this.attributes);
    const omit = keys.filter((att) => !!this.attributes[att].protected);

    data = helpers.tools.omit(data, omit);

    return data;
  },
};
