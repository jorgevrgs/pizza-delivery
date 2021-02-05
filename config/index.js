/**
 * Create and export configuration variables
 * @module config
 */

// Dependencies
const development = require("./development");
const production = require("./production");

// Container for all environments
let environments = { development, production };

// Determine which environment was passed as a command-line argument
const currentEnvironment =
  typeof process.env.NODE_ENV === "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "development";

// Check that the current environment is one of the environments above, if not default to staging
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.development;

// Export the module
module.exports = environmentToExport;
