/**
 * @module helpers.tools
 */

// Dependencies
const crypto = require("crypto");

let tools = {};

/**
 *
 * @param {string} str JSON string to be parse into an object
 */
tools.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

tools.utf8ToBase64 = function (from) {
  return Buffer.from(from, "utf8").toString("base64");
};

/**
 *
 * @param {string} from Origin string
 * @returns {string} Base 64 string
 */
tools.utf8ToBase64 = function (from) {
  return Buffer.from(from, "utf8").toString("base64");
};

/**
 * Create a string of random alphanumeric characters, of a given length
 *
 * @param {number} length
 * @param {string} flag
 */
tools.createRandomString = function (length = 8, flag = "ALPHANUMERIC") {
  length = parseInt(length);

  if (length < 0) {
    return false;
  }

  let str;
  switch (flag) {
    case "NUMERIC":
      str = "0123456789";
      break;
    case "NO_NUMERIC":
      str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      break;
    case "RANDOM":
      const numBytes = Math.ceil(length * 0.75);
      const bytes = this.getBytes(numBytes);

      str = this.rtrim(btoa(bytes), "=");

      return str.substr(0, length);

    case "ALPHANUMERIC":
    default:
      str = "abcdefghijkmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      break;
  }

  const bytes = this.getBytes(length);
  let position = 0;
  let result = "";

  for (let i = 0; i < length; i++) {
    position = (position + this.ord(bytes[i])) % str.length;

    result += str[position];
  }

  return result;
};

/**
 *
 * @param {number} length
 */
tools.getBytes = function (length) {
  length = parseInt(length);

  if (length < 0) {
    return false;
  }

  const buf = crypto.randomBytes(length);

  if (!buf) {
    return false;
  }

  return buf.toString("hex"); // 'utf8'
};

/**
 *
 * @param {object} origin
 * @param {array} omit
 */
tools.omit = function (origin, omit) {
  omit.forEach((key) => delete origin[key]);

  return origin;
};

/**
 *
 * @param {string} str
 */
tools.ord = function (str) {
  return str.charCodeAt(0);
};

/**
 *
 * @param {string} str Original string
 * @param {string} chr Character to be removed
 */
tools.trim = function (str, chr) {
  const rgxtrim = !chr
    ? new RegExp("^\\s+|\\s+$", "g")
    : new RegExp("^" + chr + "+|" + chr + "+$", "g");
  return str.replace(rgxtrim, "");
};

/**
 *
 * @param {string} str Original string
 * @param {string} chr Character to be removed
 */
tools.rtrim = function (str, chr) {
  const rgxtrim = !chr ? new RegExp("\\s+$") : new RegExp(chr + "+$");
  return str.replace(rgxtrim, "");
};

/**
 *
 * @param {string} str Original string
 * @param {string} chr Character to be removed
 */
tools.ltrim = function (str, chr) {
  const rgxtrim = !chr ? new RegExp("^\\s+") : new RegExp("^" + chr + "+");
  return str.replace(rgxtrim, "");
};

/**
 *
 * @param {number} length
 */
tools.generateId = function (length = 16) {
  return crypto.randomBytes(length).toString("hex");
};

module.exports = tools;
