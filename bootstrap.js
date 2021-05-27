let bootstrap = {};
const Model = require("./classes/Model");

bootstrap.init = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const inputs = require("./bootstrap/data");

      const keys = Object.keys(inputs);

      for (let key of keys) {
        const model = new Model(key);

        let list = await model.find();

        if (!list.length) {
          await model.createEach(inputs[key]);
        }
      }
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = bootstrap;
