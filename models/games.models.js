const db = require("../db/connection");
const format = require("pg-format");
const description = require("../description.json");
const { checkIfCategoryExists } = require("../db/utils");

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
    return { review: rows[0] };
  });
};

exports.alterReviewVotesById = (id, voteBody) => {
  if (voteBody.hasOwnProperty("inc_votes") && isNaN(voteBody.inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid vote.",
    });
  }
  const query = {};
  if (!voteBody.hasOwnProperty("inc_votes")) {
    query.text = `SELECT * FROM reviews WHERE review_id = ${id}`;
  } else {
    query.text = `UPDATE reviews SET votes = (votes + ${voteBody.inc_votes}) WHERE review_id = $1 RETURNING*;`;
    query.values = [id];
  }
  return db.query(query).then(({ rows }) => {
    return {
      review: rows[0],
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
      return checkIfCategoryExists(category).then(() => {
        query.text = `SELECT reviews.*, COUNT(comments.review_id)::INTEGER AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id WHERE category = $1 GROUP BY reviews.review_id ORDER BY ${criteria} ${order};`;
        query.values = [category];
        return db.query(query).then(({ rows }) => {
          return { reviews: rows };
        });
      });
    } else {
      return db
        .query(
          `SELECT reviews.*, COUNT(comments.review_id)::INTEGER AS comment_count FROM reviews LEFT JOIN comments ON reviews.review_id = comments.review_id GROUP BY reviews.review_id ORDER BY ${criteria} ${order};`
        )
        .then(({ rows }) => {
          return { reviews: rows };
        });
    }
  }
};

exports.selectCommentsByReviewId = (id) => {
  const query = {
    text: `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at desc;`,
    values: [id],
  };
  return db.query(query).then(({ rows }) => {
    return { comments: rows };
  });
};

exports.insertComment = (id, comment) => {
  const { username, body } = comment;
  if (body === undefined) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Incomplete post body.",
    });
  }
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

exports.fetchDescription = () => {
  return Promise.resolve(description);
};

exports.selectUsers = ({ criteria, order }) => {
  if (!["username"].includes(criteria)) {
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
    return db
      .query(`SELECT username FROM users ORDER BY ${criteria} ${order};`)
      .then(({ rows }) => {
        return { users: rows };
      });
  }
};

exports.selectUserByUsername = (username) => {
  const query = {
    text: `SELECT * FROM users WHERE username = $1;`,
    values: [username],
  };
  return db.query(query).then(({ rows }) => {
    return { user: rows[0] };
  });
};

exports.alterCommentVotesById = (id, voteBody) => {
  if (voteBody.hasOwnProperty("inc_votes") && isNaN(voteBody.inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid vote.",
    });
  }
  const query = {};
  if (!voteBody.hasOwnProperty("inc_votes")) {
    query.text = `SELECT * FROM comments WHERE comment_id = ${id}`;
  } else {
    query.text = `UPDATE comments SET votes = (votes + ${voteBody.inc_votes}) WHERE comment_id = $1 RETURNING*;`;
    query.values = [id];
  }
  return db.query(query).then(({ rows }) => {
    return {
      comment: rows[0],
    };
  });
};

exports.selectComments = ({ criteria, order }) => {
  if (
    ![
      "comment_id",
      "body",
      "votes",
      "author",
      "review_id",
      "created_at",
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
    return db
      .query(`SELECT * FROM comments ORDER BY ${criteria} ${order};`)
      .then(({ rows }) => {
        return { comments: rows };
      });
  }
};

exports.alterReviewBodyById = (id, body) => {
  const selectQuery = `SELECT reviews.*, COUNT(comments.review_id)::INTEGER AS comment_count 
  FROM comments JOIN reviews ON reviews.review_id = comments.review_id 
  WHERE reviews.review_id = ${id} 
  GROUP BY reviews.review_id;`;
  if (body.hasOwnProperty("review_body")) {
    const query = {
      text: `UPDATE reviews SET review_body = $1 WHERE review_id = ${id};`,
      values: [body.review_body],
    };
    return db
      .query(query)
      .then(() => {
        return db.query(selectQuery);
      })
      .then(({ rows }) => {
        return { review: rows[0] };
      });
  } else {
    return db.query(selectQuery).then(({ rows }) => {
      return { review: rows[0] };
    });
  }
};

exports.selectCommentById = (id) => {
  const query = `SELECT * FROM comments
    WHERE comment_id = ${id};`;
  return db.query(query).then(({ rows }) => {
    return { comment: rows[0] };
  });
};

exports.alterCommentBodyById = (id, body) => {
  const selectQuery = `SELECT * FROM comments WHERE comment_id = ${id};`;
  if (body.hasOwnProperty("body")) {
    const query = {
      text: `UPDATE comments SET body = $1 WHERE comment_id = ${id} RETURNING*;`,
      values: [body.body],
    };
    return db.query(query).then(({ rows }) => {
      return { comment: rows[0] };
    });
  } else {
    return db.query(selectQuery).then(({ rows }) => {
      return { comment: rows[0] };
    });
  }
};

exports.postUser = ({ username, avatar_url, name }) => {
  let avatar = avatar_url;
  if (avatar_url === undefined) {
    avatar =
      "https://www.pngfind.com/pngs/m/664-6644794_png-file-windows-10-person-icon-transparent-png.png";
  }
  if (name === undefined) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Incomplete post body.",
    });
  } else {
    const query = format(
      `
      INSERT INTO users
      (username, avatar_url, name)
      VALUES
      %L
      RETURNING*;`,
      [[username.toLowerCase(), avatar, name]]
    );
    return db.query(query).then(({ rows }) => {
      return { user: rows[0] };
    });
  }
};
