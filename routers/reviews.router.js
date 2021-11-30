const reviewsRouter = require("express").Router();
const { getReviewById } = require("../controllers/games.controllers");

reviewsRouter.route("/:review_id").get(getReviewById);

module.exports = reviewsRouter;
