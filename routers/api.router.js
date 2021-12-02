const apiRouter = require("express").Router();
const categoriesRouter = require("./categories.router");
const reviewsRouter = require("./reviews.router");
// apiRouter.route()
apiRouter.route("/", (req, res, next) => {
  res.status(200).send({ msg: "Hello world!" });
});
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/reviews", reviewsRouter);

module.exports = apiRouter;
