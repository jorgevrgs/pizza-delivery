module.exports = class App {
  constructor(req, res) {
    this.raw = {
      req,
      res,
    };

    this.finished = false;

    this.classes = {};
    this.helpers = {};
    this.middlewares = {};
    this.models = {};
    this.req = {};
    this.res = {};
    this.routes = {};
  }

  /**
   *
   * @param {object} modules Dictionay of modules
   */
  setModules(modules) {
    Object.assign(this, modules);
    const { Request, Response } = modules.classes;

    this.req = new Request(this.raw);
    this.res = new Response(this.raw);
  }

  async process() {
    this.helpers.log.info(`${this.req.method} ${this.req.url}`);

    for (let i of Object.keys(this.middlewares)) {
      try {
        if (this.res.getStatusCode() !== null) {
          await this.middlewares.response(this);
          break;
        } else {
          await this.middlewares[i](this);
        }
      } catch (error) {
        this.app.helpers.log.error(error);
      }
    }
  }
};
