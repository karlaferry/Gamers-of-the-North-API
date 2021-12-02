const reviewsRouter = require("express").Router();
const {
  getReviewById,
  updateVotesById,
  getReviews,
} = require("../controllers/games.controllers");

reviewsRouter.route("/").get(getReviews);
reviewsRouter.route("/:review_id").get(getReviewById).patch(updateVotesById);

module.exports = reviewsRouter;
