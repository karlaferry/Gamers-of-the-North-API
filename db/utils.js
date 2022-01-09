const db = require("../db/connection");

exports.checkIfIdExists = async (paramKey, id, table) => {
  // console.log(paramKey, id, table);
  if (isNaN(id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid ID.",
    });
  } else {
    const { rows } = await db.query(
      `SELECT * FROM ${table} WHERE ${paramKey} = ${id};`
    );
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "ID does not exist.",
      });
    }
  }
};

exports.checkIfUserNameExists = async (paramKey, username, table) => {
  if (username === undefined) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Incomplete post body.",
    });
  }
  if (!isNaN(username)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid username.",
    });
  } else {
    const { rows } = await db.query(
      `SELECT * FROM ${table} WHERE ${paramKey} = $1;`,
      [username]
    );
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: "User does not exist.",
      });
    }
  }
};
exports.checkIfNewUserExists = async (paramKey, username, table) => {
  if (username === undefined) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Incomplete post body.",
    });
  }
  if (!isNaN(username)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid username.",
    });
  } else {
    const { rows } = await db.query(
      `SELECT * FROM ${table} WHERE ${paramKey} = $1;`,
      [username.toLowerCase()]
    );
    if (rows.length > 0) {
      return Promise.reject({
        status: 400,
        msg: "Username already taken.",
      });
    }
  }
};

exports.checkIfCategoryExists = async (category) => {
  const { rows } = await db.query("SELECT * FROM categories;");
  const categories = rows.map((item) => item.slug);
  if (!isNaN(category)) {
    return Promise.reject({
      status: 400,
      msg: "Bad request. Invalid category.",
    });
  } else if (!categories.includes(category)) {
    return Promise.reject({
      status: 404,
      msg: "Category does not exist.",
    });
  }
};
