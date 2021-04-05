module.exports = {
  tableName: "foods",
  attributes: {
    name: {
      type: "string",
      required: true,
      example: "Rice",
    },
    uom: {
      type: "string",
      required: true,
      example: "gr",
    },
  },
};
