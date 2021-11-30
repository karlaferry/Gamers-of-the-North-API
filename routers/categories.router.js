const categoriesRouter = require("express").Router();
const { getCategories } = require("../controllers/games.controllers");
// categoriesRouter.route()
categoriesRouter.route("/").get(getCategories);

module.exports = categoriesRouter;
