/**
 * @module helpers.tools
 */

// Dependencies
const crypto = require("crypto");

let tools = {};

tools.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

// Create a string of random alphanumeric characters, of a given length
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

tools.ord = function (str) {
  return str.charCodeAt(0);
};

tools.trim = function (str, chr) {
  const rgxtrim = !chr
    ? new RegExp("^\\s+|\\s+$", "g")
    : new RegExp("^" + chr + "+|" + chr + "+$", "g");
  return str.replace(rgxtrim, "");
};

tools.rtrim = function (str, chr) {
  const rgxtrim = !chr ? new RegExp("\\s+$") : new RegExp(chr + "+$");
  return str.replace(rgxtrim, "");
};

tools.ltrim = function (str, chr) {
  const rgxtrim = !chr ? new RegExp("^\\s+") : new RegExp("^" + chr + "+");
  return str.replace(rgxtrim, "");
};

tools.generateId = function (length = 16) {
  return crypto.randomBytes(length).toString("hex");
};

module.exports = tools;
