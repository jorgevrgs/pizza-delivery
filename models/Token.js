module.exports = {
  tableName: "tokens",
  attributes: {
    email: {
      type: "number",
      required: true,
      example: "user@example.com",
    },
    expires: {
      type: "number",
      required: true,
      example: "1234567890",
    },
  },
};
