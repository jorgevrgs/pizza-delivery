const https = require("https");

const request = function (url, options = {}, payload = "") {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(JSON.parse(data));
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
};

let helper = {};

/**
 *
 * @param {string} endpoint URL
 * @param {object} options Accepts all options from http.request()
 * @returns {Promise}
 */
helper.get = function (endpoint, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const url = new URL(endpoint, options);
      const result = await request(url);

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *
 * @param {string} endpoint URL
 * @param {object} data Body payload
 * @param {object} options Accepts all options from http.request()
 * @returns {Promise}
 */
helper.post = function (endpoint, data, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const content = JSON.stringify(data);

      const url = new URL(endpoint);

      options = Object.assign(
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": content.length,
          },
        },
        options
      );

      const result = await request(url, options, content);

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *
 * @param {string} endpoint URL
 * @param {object} data Body payload
 * @param {object} options Accepts all options from http.request()
 * @returns {Promise}
 */
helper.put = function (endpoint, data, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const content = JSON.stringify(data);

      const url = new URL(endpoint);

      options = Object.assign({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": content.length,
        },
        options,
      });

      const result = await request(url, options, content);

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *
 * @param {string} endpoint URL
 * @param {object} options Accepts all options from http.request()
 * @returns {Promise}
 */
helper.delete = function (endpoint, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const url = new URL(endpoint);

      options = Object.assign(
        {
          method: "DELETE",
        },
        options
      );

      const result = await request(url, options);

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = helper;
