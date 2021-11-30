const { selectCategories } = require("../models/games.models");

exports.getCategories = (req, res, next) => {
  return selectCategories()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch(next);
};
