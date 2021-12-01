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
  return db.query(query).then(({ rows }) => {
    return { review: rows };
  });
};

exports.alterVotesById = (id, voteBody) => {
  if (!voteBody.hasOwnProperty("inc_votes")) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid post body.",
    });
  } else if (isNaN(voteBody.inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid vote.",
    });
  }
  const query = {
    text: `UPDATE reviews SET votes = (votes + ${voteBody.inc_votes}) WHERE review_id = $1 RETURNING*;`,
    values: [id],
  };
  return db.query(query).then(({ rows }) => {
    return {
      review: rows,
    };
  });
};
