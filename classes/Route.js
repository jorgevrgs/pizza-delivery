module.exports = class Route {
  constructor(route) {
    this._route = route;
    this._routes = {};

    // Define all the handlers
    let routes = {};

    // Ping
    routes.ping = function (req, res) {
      res.send({
        method: req.method,
        headers: req.headers,
        body: req.getBody(),
      });

      return { req, res };
    };

    // Not-Found
    routes.notFound = function (_req, res) {
      res.sendStatus(404);

      return { req, res };
    };

    routes.clientError = function (_req, res) {
      res.sendStatus(res.getStatusCode());

      return { req, res };
    };

    this.setRoutes(routes);
  }

  getRoutes() {
    return this._routes;
  }

  setRoutes(routes) {
    Object.assign(this._routes, routes);
  }

  getRoute() {
    if (typeof this._routes[this._route] !== "undefined") {
      return this._routes[this._route];
    } else {
      return this._routes.notFound;
    }
  }

  setRoute(route) {
    this._routes.push(route);
  }
};
