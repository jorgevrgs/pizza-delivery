/**
 * Authentication Middleware
 *
 * @param {object} app Main applicaction object
 *
 * @example {
 *   req,
 *   res,
 *   helpers,
 *   config,
 *   routes,
 *   models,
 * }
 */
module.exports = function (app) {
  // Get token from headers
  const token =
    typeof app.request.headers.token === "string"
      ? app.request.headers.token
      : false;

  app.helpers.log.warn({ token });
};
