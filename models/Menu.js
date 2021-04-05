// @see http://www.thepenguinpizza.com/pizzamenu
module.exports = {
  tableName: "menus",
  attributes: {
    name: {
      type: "string",
      required: true,
      example: "The ULTIMATE Penguin",
    },
    ingredients: {
      type: "string",
      required: true,
      example:
        "Bacon, ham, meatball, sweet sausage, roasted potato, hot cherry peppers, caramelized onions",
    },
    price: {
      type: "number",
      required: true,
      example: 19.99,
    },
  },
};
