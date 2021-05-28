module.exports = async function (app) {
  const { Route } = app.classes;
  // Load routes
  const route = new Route(app.req.trimmedPath);
  route.setRoutes(app.routes);

  // Load handler
  const chosenHandler = route.getRoute();

  // Run route
  try {
    await chosenHandler(app.req, app.res);
  } catch (error) {
    app.helpers.log.error(error);
  }
};
