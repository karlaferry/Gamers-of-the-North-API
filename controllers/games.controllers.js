const {
  selectCategories,
  selectReviewById,
  alterVotesById,
  selectReviews,
  selectCommentsByReviewId,
} = require("../models/games.models");
const { checkIfIdExists } = require("../db/utils");
const { lastIndexOf } = require("../db/data/test-data/categories");

exports.getCategories = (req, res, next) => {
  selectCategories()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  return Promise.all([
    selectReviewById(review_id),
    checkIfIdExists("review_id", review_id, "reviews"),
  ])
    .then((response) => {
      res.status(200).send(response[0]);
    })
    .catch(next);
};

exports.updateVotesById = (req, res, next) => {
  const { review_id } = req.params;
  const { body } = req;
  return Promise.all([
    alterVotesById(review_id, body),
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

  selectReviews(queries)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  return Promise.all([
    selectCommentsByReviewId(review_id),
    checkIfIdExists("review_id", review_id, "reviews"),
  ])
    .then((response) => {
      res.status(200).send(response[0]);
    })
    .catch(next);
};
