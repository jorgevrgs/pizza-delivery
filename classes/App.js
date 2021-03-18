module.exports = class App {
  constructor(req, res) {
    this.req = req;
    this.res = res;

    this.classes = {};
    this.helpers = {};
    this.middlewares = {};
    this.models = {};
    this.request = {};
    this.response = {};
    this.routes = {};
  }

  /**
   *
   * @param {object} modules Dictionay of modules
   */
  setModules(modules) {
    Object.assign(this, modules);
    const { Request, Response } = modules.classes;

    this.request = new Request(this.req);
    this.response = new Response(this.res);
  }

  async process() {
    this.helpers.log.info(`${this.req.method} ${this.req.url}`);

    const { authentication, controller, response } = this.middlewares;

    Object.assign(this, await authentication(this));
    Object.assign(this, await controller(this));
    Object.assign(this, await response(this));
  }
};
