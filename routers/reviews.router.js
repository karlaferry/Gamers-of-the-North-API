const reviewsRouter = require("express").Router();
const {
  getReviewById,
  updateReviewVotesById,
  getReviews,
  getCommentsByReviewId,
  postComment,
} = require("../controllers/games.controllers");

reviewsRouter.route("/").get(getReviews);
reviewsRouter
  .route("/:review_id")
  .get(getReviewById)
  .patch(updateReviewVotesById);
reviewsRouter
  .route("/:review_id/comments")
  .get(getCommentsByReviewId)
  .post(postComment);
module.exports = reviewsRouter;
