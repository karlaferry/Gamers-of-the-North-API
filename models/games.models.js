const db = require("../db/connection");

exports.selectCategories = () => {
  return db.query("SELECT * FROM categories").then(({ rows }) => {
    return { categories: rows };
  });
};

exports.selectReviewById = (id) => {
  const query = {
    text: `
    SELECT reviews.*, COUNT(comments.review_id)::INTEGER AS comment_count 
    FROM comments JOIN reviews ON reviews.review_id = comments.review_id 
    WHERE reviews.review_id = $1 
    GROUP BY reviews.review_id;`,
    values: [id],
  };
  if (isNaN(id) === true) {
    return Promise.reject({
      status: 400,
      msg: "Bad request.",
    });
  }
  return db.query(query).then(({ rows }) => {
    if (rows[0] === undefined) {
      return Promise.reject({
        status: 404,
        msg: "ID does not exist.",
      });
    }
    return { review: rows };
  });
};
