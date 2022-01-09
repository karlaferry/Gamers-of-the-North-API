const commentsRouter = require("express").Router();
const {
  deleteComment,
  updateCommentVotesById,
  getComments,
  getCommentById,
  updateCommentBodyById,
} = require("../controllers/games.controllers");

commentsRouter.route("/").get(getComments);
commentsRouter
  .route("/:comment_id")
  .get(getCommentById)
  .delete(deleteComment)
  .patch(updateCommentVotesById);
commentsRouter.route("/:comment_id/body").patch(updateCommentBodyById);

module.exports = commentsRouter;
