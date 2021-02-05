/**
 * @module helpers.log
 */

const RESET = "\x1b[0m";

const BG_BLUE = "\x1b[44m";
const BG_CYAN = "\x1b[46m";
const BG_GREEN = "\x1b[42m";
const BG_MAGENTA = "\x1b[45m";
const BG_RED = "\x1b[41m";
const BG_YELLOW = "\x1b[43m";

const TXT_BLUE = "\x1b[34m";
const TXT_CYAN = "\x1b[36m";
const TXT_GREEN = "\x1b[32m";
const TXT_MAGENTA = "\x1b[35m";
const TXT_RED = "\x1b[31m";
const TXT_WHITE = "\x1b[37m";
const TXT_YELLOW = "\x1b[33m";

// const INFO_BG = `${BG_BLUE}${TXT_WHITE}`;
// const SUCCESS_BG = `${BG_GREEN}${TXT_WHITE}`;
// const ERROR_BG = `${BG_RED}${TXT_WHITE}`;
// const WARN_BG = `${BG_YELLOW}${TXT_WHITE}`;
// const VERBOSE_BG = `${BG_CYAN}${TXT_WHITE}`;
// const DEBUG_BG = `${BG_MAGENTA}${TXT_WHITE}`;

const INFO_TXT = `${TXT_BLUE}`;
const SUCCESS_TXT = `${TXT_GREEN}`;
const ERROR_TXT = `${TXT_RED}`;
const WARN_TXT = `${TXT_YELLOW}`;
const VERBOSE_TXT = `${TXT_CYAN}`;
const DEBUG_TXT = `${TXT_MAGENTA}`;

const info = function (...args) {
  console.info(INFO_TXT, "[info]:   ", ...args, RESET);
};

const success = function (...args) {
  console.info(SUCCESS_TXT, "[success]:", ...args, RESET);
};

const error = function (...args) {
  console.error(ERROR_TXT, "[error]:  ", ...args, RESET);
};

const warn = function (...args) {
  console.warn(WARN_TXT, "[warn]:   ", ...args, RESET);
};

const verbose = function (...args) {
  console.log(VERBOSE_TXT, "[verbose]:", ...args, RESET);
};

// @TODO: user with debug() for NODE_DEBUG values
const debug = function (name, ...args) {
  const util = require("util");
  const debug = util.debuglog(`--- ${name} ---`);

  debug(DEBUG_TXT, "[debug]:  ", ...args, RESET);
};

module.exports = {
  info,
  success,
  error,
  warn,
  verbose,
  debug,
};
