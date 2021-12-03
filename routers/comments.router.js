const commentsRouter = require("express").Router();
const {
  deleteComment,
  updateCommentVotesById,
} = require("../controllers/games.controllers");

commentsRouter
  .route("/:comment_id")
  .delete(deleteComment)
  .patch(updateCommentVotesById);

module.exports = commentsRouter;
