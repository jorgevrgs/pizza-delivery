module.exports = function (app) {
  const res = app.res;

  app.response.json(app.response.getPayload());

  for (let [key, value] of Object.entries(app.response.getHeaders())) {
    res.setHeader(key, value);
  }
  res.writeHead(app.response.getStatusCode());
  res.end(app.response.getBody());

  return app;
};
