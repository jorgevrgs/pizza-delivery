module.exports = {
  tableName: "items",
  attributes: {
    order: {
      type: "string",
      required: true,
      model: "Order",
      example: "abcd1234",
    },
    quantity: {
      type: "number",
      required: true,
      example: 1,
    },
    menu: {
      type: "string",
      required: true,
      model: "Menu",
      example: "abcd1234",
    },
    price: {
      type: "number",
      required: true,
      example: 9.99,
    },
  },
};
