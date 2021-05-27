module.exports = async function (app) {
  const { Route } = app.classes;
  // Load routes
  const route = new Route(app.req.trimmedPath);
  route.setRoutes(app.routes);

  // Load handler
  const chosenHandler = route.getRoute();

  // Run route
  const result = await chosenHandler(app.req, app.res);

  app.req = result.req;
  app.res = result.res;

  return app;
};
