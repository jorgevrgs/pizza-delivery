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
    typeof app.req.headers.authorization === "string"
      ? app.req.headers.authorization.replace("Bearer ", "")
      : false;

  // Authorization token received, else proceed
  if (token) {
    const tokenArray = token.split(".");

    if (tokenArray.length === 3) {
      const userId = tokenArray[0];
      const tokenId = tokenArray[1];

      const localSignature = app.helpers.password.hash(`${userId}.${tokenId}.`);
      if (localSignature === tokenArray[2] && tokenId && userId) {
        if (await app.helpers.validate.verifyToken(tokenId, userId)) {
          app.req.userId = userId;
        }
      }
    }
  }

  return app;
};
