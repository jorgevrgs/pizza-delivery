module.exports = {
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
};
