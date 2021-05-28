module.exports = function (app) {
  const { res } = app.raw;

  if (app.res.getResponseType() === "json") {
    app.res.json(app.res.getPayload());
  }

  for (let [key, value] of Object.entries(app.res.getHeaders())) {
    res.setHeader(key, value);
  }

  res.writeHead(app.res.getStatusCode());
  res.end(app.res.getBody());
};
