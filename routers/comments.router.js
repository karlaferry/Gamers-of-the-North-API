const commentsRouter = require("express").Router();
const {
  deleteComment,
  updateCommentVotesById,
  selectComments,
} = require("../controllers/games.controllers");

commentsRouter.route("/").get(selectComments);
commentsRouter
  .route("/:comment_id")
  .delete(deleteComment)
  .patch(updateCommentVotesById);

module.exports = commentsRouter;
