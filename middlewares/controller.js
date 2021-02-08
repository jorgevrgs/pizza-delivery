module.exports = function (app) {
  const req = app.request;
  const res = app.response;
  const routes = app.routes;
  const trimmedPath = req.trimmedPath;

  const chosenHandler =
    typeof routes[trimmedPath] !== "undefined"
      ? routes[trimmedPath]
      : routes.notFound;

  chosenHandler(req, res);
};
