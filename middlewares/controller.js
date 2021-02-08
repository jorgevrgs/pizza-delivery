module.exports = async function (app) {
  // Load routes
  const route = new app.Route(app.request.trimmedPath);
  route.setRoutes(app.routes);

  // Load handler
  const chosenHandler = route.getRoute();

  // Run route
  const result = await chosenHandler(app.request, app.response);

  app.request = result.req;
  app.response = result.res;

  return app;
};
