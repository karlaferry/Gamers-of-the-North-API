const {
  selectCategories,
  selectReviewById,
  alterReviewVotesById,
  selectReviews,
  selectCommentsByReviewId,
  insertComment,
  removeComment,
  fetchDescription,
  selectUsers,
  selectUserByUsername,
  alterCommentVotesById,
  selectComments,
  alterReviewBodyById,
  selectCommentById,
  alterCommentBodyById,
  postUser,
  selectCommentsByUser,
} = require("../models/games.models");
const {
  checkIfIdExists,
  checkIfUserNameExists,
  checkIfNewUserExists,
  checkIfCategoryExists,
} = require("../db/utils");

exports.getCategories = (req, res, next) => {
  selectCategories()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  checkIfIdExists("review_id", review_id, "reviews")
    .then(() => {
      return selectReviewById(review_id);
    })
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.updateReviewVotesById = (req, res, next) => {
  const { review_id } = req.params;
  const { body } = req;
  return Promise.all([
    alterReviewVotesById(review_id, body),
    checkIfIdExists("review_id", review_id, "reviews"),
  ])
    .then((response) => {
      res.status(200).send(response[0]);
    })
    .catch(next);
};

exports.getReviews = (req, res, next) => {
  const queries = {};
  queries.criteria = req.query.sort_by || "created_at";
  queries.order = req.query.order || "DESC";
  if (req.query.hasOwnProperty("category")) {
    queries.category = req.query.category;
  }
  if (req.query.hasOwnProperty("limit")) {
    queries.limit = req.query.limit;
    queries.p = req.query.p || 0;
  }
  return checkIfCategoryExists(queries.category)
    .then(() => {
      return selectReviews(queries);
    })
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.getCommentsByReviewId = (req, res, next) => {
  const queries = {};
  queries.criteria = req.query.sort_by || "created_at";
  queries.order = req.query.order || "DESC";

  const { review_id } = req.params;
  return Promise.all([
    selectCommentsByReviewId(review_id, queries),
    checkIfIdExists("review_id", review_id, "reviews"),
  ])
    .then((response) => {
      res.status(200).send(response[0]);
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { body } = req;
  const { review_id } = req.params;

  return Promise.all([
    checkIfIdExists("review_id", review_id, "reviews"),
    checkIfUserNameExists("username", body.username, "users"),
  ])
    .then(() => {
      return insertComment(review_id, body);
    })
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  return checkIfIdExists("comment_id", comment_id, "comments")
    .then(() => {
      return removeComment(comment_id);
    })
    .then(() => {
      res.status(204).send("");
    })
    .catch(next);
};

exports.getDescription = (req, res, next) => {
  fetchDescription()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  const queries = {};
  queries.criteria = req.query.sort_by || "username";
  queries.order = req.query.order || "ASC";

  selectUsers(queries)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  return checkIfUserNameExists("username", username, "users")
    .then(() => {
      return selectUserByUsername(username);
    })
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.updateCommentVotesById = (req, res, next) => {
  const { comment_id } = req.params;
  const { body } = req;
  return Promise.all([
    alterCommentVotesById(comment_id, body),
    checkIfIdExists("comment_id", comment_id, "comments"),
  ])
    .then((response) => {
      res.status(200).send(response[0]);
    })
    .catch(next);
};

exports.getComments = (req, res, next) => {
  const queries = {};
  queries.criteria = req.query.sort_by || "created_at";
  queries.order = req.query.order || "DESC";

  selectComments(queries)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.updateReviewBody = (req, res, next) => {
  const { review_id } = req.params;
  const { body } = req;
  return Promise.all([
    alterReviewBodyById(review_id, body),
    checkIfIdExists("review_id", review_id, "reviews"),
  ])
    .then((response) => {
      res.status(201).send(response[0]);
    })
    .catch(next);
};

exports.getCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  return Promise.all([
    selectCommentById(comment_id),
    checkIfIdExists("comment_id", comment_id, "comments"),
  ])
    .then((response) => {
      res.status(200).send(response[0]);
    })
    .catch(next);
};

exports.updateCommentBodyById = (req, res, next) => {
  const { comment_id } = req.params;
  const { body } = req;
  return Promise.all([
    alterCommentBodyById(comment_id, body),
    checkIfIdExists("comment_id", comment_id, "comments"),
  ])
    .then((response) => {
      res.status(201).send(response[0]);
    })
    .catch(next);
};

exports.addUser = (req, res, next) => {
  const { body } = req;

  checkIfNewUserExists("username", body.username, "users")
    .then(() => {
      return postUser(body);
    })
    .then((response) => {
      res.status(201).send(response);
    })
    .catch(next);
};

exports.getCommentsByUser = (req, res, next) => {
  const { username } = req.params;
  checkIfUserNameExists("username", username, "users")
    .then(() => {
      return selectCommentsByUser(username);
    })
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((err) => {
      console.log(err);
    });
};
