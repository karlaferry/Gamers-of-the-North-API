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
