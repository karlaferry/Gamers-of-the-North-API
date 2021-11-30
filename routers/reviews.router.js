const reviewsRouter = require("express").Router();
const {
  getReviewById,
  updateVotesById,
} = require("../controllers/games.controllers");

reviewsRouter.route("/:review_id").get(getReviewById).patch(updateVotesById);

module.exports = reviewsRouter;
