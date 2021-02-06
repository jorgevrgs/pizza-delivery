const helpers = require("../helpers");

module.exports = {
  primaryKey: "email",
  attributtes: {
    firstName: {
      type: "string",
      required: true,
      example: "John",
    },
    lastName: {
      type: "string",
      required: true,
      example: "Doe",
    },
    email: {
      type: "string",
      required: true,
      example: "user@example.com",
    },
    password: {
      type: "string",
      required: true,
      protected: true,
    },
    address: {
      type: "object",
      required: true,
      example: {
        street: "5th Av 123 NW",
        city: "New York",
        state: "NY",
        country: "US",
      },
    },
  },
  beforeCreate(data) {
    if (typeof data.password !== "undefined") {
      data.password = helpers.password.hash(data.password);
    }

    return data;
  },
  beforeUpdate(data) {
    if (typeof data.password !== "undefined") {
      data.password = helpers.password.hash(data.password);
    }

    return data;
  },
  beforeResponse(data) {
    const keys = Object.keys(this.attributtes);
    const omit = keys.filter((att) => !!this.attributtes[att].protected);

    data = helpers.tools.omit(data, omit);

    return data;
  },
};
