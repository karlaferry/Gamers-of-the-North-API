const apiRouter = require("express").Router();
const categoriesRouter = require("./categories.router");
// apiRouter.route()
apiRouter.use("/categories", categoriesRouter);

module.exports = apiRouter;
