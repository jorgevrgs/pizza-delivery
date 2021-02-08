module.exports = function (app) {
  /**
   * @param {Request} Class
   */
  const response = app.response;

  const res = app.res;

  response.json(response.getPayload());

  for (let [key, value] of Object.entries(response.getHeaders())) {
    res.setHeader(key, value);
  }
  res.writeHead(response.getStatusCode());
  res.end(response.getBody());

  return app;
};
