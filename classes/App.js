module.exports = class App {
  constructor(req, res) {
    this.req = req;
    this.res = res;

    this.helpers = {};
    this.middlewares = {};
    this.models = {};
    this.routes = {};

    /**
     * @param {class} Model
     */
    this.Model = {};

    /**
     * @param {class} Request
     */
    this.Request = {};

    /**
     * @param {class} Response
     */
    this.Response = {};
  }

  /**
   *
   * @param {object} modules Dictionay of modules
   */
  setModules(modules) {
    Object.assign(this, modules);

    this.request = new this.Request(this.req);
    this.response = new this.Response(this.res);
  }
};
