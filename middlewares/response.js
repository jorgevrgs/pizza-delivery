module.exports = function (app) {
  const { res } = app.raw;

  app.res.json(app.res.getPayload());

  for (let [key, value] of Object.entries(app.res.getHeaders())) {
    res.setHeader(key, value);
  }
  res.writeHead(app.res.getStatusCode());
  res.end(app.res.getBody());

  return app;
};
