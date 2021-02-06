module.exports = {
  attributtes: {
    name: {
      type: "string",
      required: true,
    },
    ingredients: {
      type: "object",
      required: true,
      model: "Food",
      example: [
        {
          id: "abcd1234",
          name: "Hamburger Buns",
          quantity: 1,
          uom: "unit",
        },
        {
          id: "fghj4321",
          name: "Ground Beef Patties",
          quantity: 100,
          uom: "gr",
        },
      ],
    },
    price: {
      type: "number",
      required: true,
      example: 99.99,
    },
  },
};
