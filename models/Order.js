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
  tableName: "orders",
  attributes: {
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
        street: "5th Av 123 NW",
        city: "New York",
        state: "NY",
        country: "US",
      },
      validate: (address) => {
        return (
          address.street != null &&
          address.city != null &&
          address.state != null &&
          address.country != null
        );
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
