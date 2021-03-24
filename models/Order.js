/**
 * Contains the order information
 *
 * @example {
 *   date: '2016-05-18T16:00:00Z',
 *   customer: 'abcd1234',
 *   items: ['abcd1234', 'abcd1235']
 * }
 */

module.exports = {
  attributtes: {
    date: {
      type: "string",
      required: true,
      example: "2016-05-18T16:00:00Z",
    },
    customer: {
      type: "string",
      required: true,
      model: "Customer",
      example: "abcd1234",
    },
    items: {
      type: "string",
      required: true,
      collection: "Item",
      via: "order",
      example: "abcd1234",
    },
    address: {
      type: "object",
      required: true,
      example: {
        street: "5th Av 1005",
        city: "New York",
        state: "NY",
        phone: "+19876543212",
      },
    },
    state: {
      type: "string",
      isIn: ["draft", "pending", "paid"],
      default: "draft",
    },
    transactionId: {
      type: "string",
      default: "",
    },
  },
};
