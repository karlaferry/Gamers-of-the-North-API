const db = require("../connection");
const format = require("pg-format");

const seed = (data) => {
  const { categoryData, commentData, reviewData, userData } = data;
  return db
    .query("DROP TABLE IF EXISTS comments")
    .then(() => {
      return db.query("DROP TABLE IF EXISTS reviews");
    })
    .then(() => {
      return Promise.all([
        db.query("DROP TABLE IF EXISTS categories"),
        db.query("DROP TABLE IF EXISTS users"),
      ]);
    })
    .then(() => {
      const createUsers = `CREATE TABLE users (
          username VARCHAR PRIMARY KEY,
          avatar_url TEXT,
          name VARCHAR
        );`;
      const createCategories = `CREATE TABLE categories
        (slug VARCHAR PRIMARY KEY,
          description TEXT);`;

      return Promise.all([db.query(createUsers), db.query(createCategories)]);
    })
    .then(() => {
      return db.query(`CREATE TABLE reviews (
          review_id SERIAL PRIMARY KEY,
          title VARCHAR,
          review_body TEXT,
          designer VARCHAR,
          review_img_url TEXT DEFAULT 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg',
          votes INT DEFAULT 0,
          category VARCHAR REFERENCES categories(slug),
          owner VARCHAR REFERENCES users(username),
          created_at TIMESTAMP DEFAULT NOW()
        );`);
    })
    .then(() => {
      return db.query(`CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        author VARCHAR REFERENCES users(username),
        review_id INT REFERENCES reviews(review_id),
        votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        body TEXT
      );`);
    })
    .then(() => {
      const insertCategories = format(
        `INSERT INTO categories
      (slug, description)
      VALUES
      %L;`,
        categoryData.map((cat) => [cat.slug, cat.description])
      );
      const insertUsers = format(
        `INSERT INTO users
      (username, avatar_url, name)
      VALUES
      %L;`,
        userData.map((user) => [user.username, user.avatar_url, user.name])
      );
      return Promise.all([db.query(insertCategories), db.query(insertUsers)]);
    })
    .then(() => {
      const insertReviews = format(
        `INSERT INTO reviews
        (title, review_body, designer, review_img_url, votes, category, owner, created_at)
        VALUES
        %L;`,
        reviewData.map((review) => [
          review.title,
          review.review_body,
          review.designer,
          review.review_img_url,
          review.votes,
          review.category,
          review.owner,
          review.created_at,
        ])
      );
      return db.query(insertReviews);
    })
    .then(() => {
      const insertComments = format(
        `INSERT INTO comments
        (author, review_id, votes, created_at, body)
        VALUES
        %L;`,
        commentData.map((comment) => [
          comment.author,
          comment.review_id,
          comment.votes,
          comment.created_at,
          comment.body,
        ])
      );
      return db.query(insertComments);
    })
    .catch(console.log);
};

module.exports = seed;
