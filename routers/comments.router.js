const commentsRouter = require("express").Router();
const {
  deleteComment,
  updateCommentVotesById,
  selectComments,
  getCommentById,
} = require("../controllers/games.controllers");

commentsRouter.route("/").get(selectComments);
commentsRouter
  .route("/:comment_id")
  .get(getCommentById)
  .delete(deleteComment)
  .patch(updateCommentVotesById);

module.exports = commentsRouter;
