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
module.exports = async function (app) {
  // Get token from headers
  const token =
    typeof app.request.headers.token === "string"
      ? app.request.headers.token
      : false;

  // Authorization token received, else proceed
  if (token) {
    const tokenArray = token.split(".");

    if (tokenArray.length === 2) {
      const userId = tokenArray[0];
      const tokenId = tokenArray[1];

      if (tokenId && userId) {
        if (await app.helpers.validate.verifyToken(tokenId, userId)) {
          app.request.userId = userId;
        }
      }
    }
  }

  return app;
};
