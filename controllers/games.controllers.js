const {
  selectCategories,
  selectReviewById,
  alterVotesById,
} = require("../models/games.models");
const { checkIfIdExists } = require("../db/utils");

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
    alterVotesById(review_id, body.inc_votes),
    checkIfIdExists("review_id", review_id, "reviews"),
  ])
    .then((response) => {
      res.status(200).send(response[0]);
    })
    .catch(next);
};
