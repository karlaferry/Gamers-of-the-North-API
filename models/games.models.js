const db = require("../db/connection");
const format = require("pg-format");

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

exports.selectReviews = ({ criteria, order, category }) => {
  if (
    ![
      "owner",
      "title",
      "review_id",
      "category",
      "created_at",
      "votes",
      "comment_count",
    ].includes(criteria)
  ) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid criteria.",
    });
  } else if (!["ASC", "DESC", "asc", "desc"].includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid order.",
    });
  } else {
    const query = {};
    if (category !== undefined) {
      query.text = `SELECT reviews.*, COUNT(comments.review_id)::INTEGER AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id WHERE category = $1 GROUP BY reviews.review_id ORDER BY ${criteria} ${order};`;
      query.values = [category];
    } else {
      query.text = `SELECT reviews.*, COUNT(comments.review_id)::INTEGER AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id GROUP BY reviews.review_id ORDER BY ${criteria} ${order};`;
    }
    return db.query(query).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Category does not exist.",
        });
      }
      return { reviews: rows };
    });
  }
};

exports.selectCommentsByReviewId = (id) => {
  const query = {
    text: `SELECT * FROM comments WHERE review_id = $1;`,
    values: [id],
  };
  return db.query(query).then(({ rows }) => {
    return { comments: rows };
  });
};

exports.insertComment = (id, comment) => {
  const { username, body } = comment;
  const query = format(
    `
  INSERT INTO comments
  (author, review_id, body)
  VALUES
  %L
  RETURNING*;`,
    [[username, id, body]]
  );
  return db.query(query).then(({ rows }) => {
    return { comment: rows[0] };
  });
};

exports.removeComment = (id) => {
  const query = {
    text: `DELETE FROM comments WHERE comment_id = $1;`,
    values: [id],
  };
  return db.query(query);
};
