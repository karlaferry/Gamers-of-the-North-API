const request = require("supertest");
const db = require("../db/connection.js");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const app = require("../app");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  it("200: returns a JSON object describing the API", async () => {
    const { body } = await request(app).get("/api").expect(200);
    expect(body).toBeInstanceOf(Object);
  });
});

describe("GET /api/categories", () => {
  it("200: returns an array of categories", async () => {
    const {
      body: { categories },
    } = await request(app).get("/api/categories").expect(200);
    expect(categories).toHaveLength(4);
    expect(categories).toBeInstanceOf(Array);
  });
  it("200: objects in array contains slug and description", async () => {
    const {
      body: { categories },
    } = await request(app).get("/api/categories").expect(200);
    categories.forEach((category) => {
      expect(category).toEqual(
        expect.objectContaining({
          slug: expect.any(String),
          description: expect.any(String),
        })
      );
    });
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app)
      .get("/api/categoriez")
      .expect(404);
    expect(statusCode).toBe(404);
  });
});

describe("GET /api/comments", () => {
  it("200: returns an array of all comment objects with comment_id, body, votes, author, review_id, and created_at properties", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/comments").expect(200);
    expect(comments).toBeInstanceOf(Array);
    expect(comments).toHaveLength(6);
    comments.forEach((comment) => {
      expect(comment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          body: expect.any(String),
          votes: expect.any(Number),
          author: expect.any(String),
          review_id: expect.any(Number),
          created_at: expect.any(String),
        })
      );
    });
  });
  it("200: returns an array of objects sorted by created_at in descending order by default", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/comments").expect(200);
    expect(comments).toBeSortedBy("created_at", { descending: true });
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app).get("/api/commentz").expect(404);
    expect(statusCode).toBe(404);
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  it("200: returns the updated comment with increased votes", async () => {
    const { rows } = await db.query(
      `SELECT * FROM comments WHERE comment_id = 2`
    );
    const originalVoteCount = rows[0].votes;
    const {
      body: { comment },
    } = await request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: 1 })
      .expect(200);
    expect(comment).toBeInstanceOf(Object);
    expect(comment.votes).toBe(originalVoteCount + 1);
  });
  it("200: returns the updated comment with decreased votes ", async () => {
    const { rows } = await db.query(
      `SELECT * FROM comments WHERE comment_id = 2`
    );
    const originalVoteCount = rows[0].votes;
    const {
      body: { comment },
    } = await request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: -10 })
      .expect(200);
    expect(comment).toBeInstanceOf(Object);
    expect(comment.votes).toBe(originalVoteCount - 10);
  });
  it("200: returns the unaltered review if 'inc_votes' key does not exist", async () => {
    const {
      body: { comment },
    } = await request(app)
      .patch("/api/comments/2")
      .send({ inc_votez: 1 })
      .expect(200);
    const { rows } = await db.query(
      "SELECT * FROM comments WHERE comment_id = 2"
    );
    expect(comment.votes).toBe(rows[0].votes);
  });
  it("400: returns 'Bad request. Invalid ID' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/comments/bananas")
      .send({ inc_votes: 1 })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid ID.");
  });
  it("400: returns 'Bad request. Invalid vote.' when post body object value is not a number ", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/comments/2")
      .send({ inc_votes: "one" })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid vote.");
  });
  it("404: returns 'ID does not exist.' when id doesn't exist", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/comments/55")
      .send({ inc_votes: 1 })
      .expect(404);
    expect(msg).toBe("ID does not exist.");
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app)
      .patch("/api/commentz/2")
      .send({ inc_votes: 1 })
      .expect(404);
    expect(statusCode).toBe(404);
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  it("204: deletes the comment and returns no content", async () => {
    const { statusCode } = await request(app)
      .delete("/api/comments/2")
      .expect(204);
    expect(statusCode).toBe(204);
    const { rows } = await db.query(
      "SELECT * FROM comments WHERE comment_id = 2"
    );
    expect(rows).toHaveLength(0);
  });
  it("400: returns 'Bad request. Invalid ID' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app).delete("/api/comments/bananas").expect(400);
    expect(msg).toBe("Bad request. Invalid ID.");
  });
  it("404: returns 'ID does not exist' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app).delete("/api/comments/34985739457").expect(404);
    expect(msg).toBe("ID does not exist.");
  });
});

describe("GET /api/reviews", () => {
  it('200: returns an object with "reviews" key and value of array', async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews").expect(200);
    expect(reviews).toBeInstanceOf(Array);
  });
  it("200: object in array contains owner, title, review_id, review_body, designer, review_img_url, category, created_at, votes, comment_count", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews").expect(200);
    expect(reviews).toHaveLength(13);
    reviews.forEach((review) => {
      expect(review).toEqual(
        expect.objectContaining({
          owner: expect.any(String),
          title: expect.any(String),
          review_id: expect.any(Number),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          category: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          comment_count: expect.any(Number),
        })
      );
    });
  });
  it("200: returns an array of objects sorted by date and ordered by descending by default", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews").expect(200);
    expect(reviews).toBeSortedBy("created_at", { descending: true });
  });
  it("200: returns an array of objects sorted by votes and default order", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews?sort_by=votes").expect(200);
    expect(reviews).toBeSortedBy("votes", { descending: true });
  });
  it("200: returns an array of objects with ascending order of default criteria", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews?order=asc").expect(200);
    expect(reviews).toBeSortedBy("created_at", { descending: false });
  });
  it("200: returns an array of objects sorted by votes in ascending order", async () => {
    const {
      body: { reviews },
    } = await request(app)
      .get("/api/reviews?sort_by=votes&order=asc")
      .expect(200);
    expect(reviews).toBeSortedBy("votes", { descending: false });
  });
  it("200: returns an array of objects filtered by category", async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews?category=euro%20game").expect(200);
    expect(reviews).toHaveLength(1);
  });
  it("200: returns an empty array if category exists but no reviews", async () => {
    const {
      body: { reviews },
    } = await request(app)
      .get("/api/reviews?category=children%27s%20games")
      .expect(200);
    expect(reviews).toHaveLength(0);
  });
  it("400: returns a bad request when sort_by criteria is invalid", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/reviews?sort_by=bananas").expect(400);
    expect(msg).toBe("Bad request. Invalid criteria.");
  });
  it("400: returns a bad request when order is invalid", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/reviews?order=bananas").expect(400);
    expect(msg).toBe("Bad request. Invalid order.");
  });
  it("400: returns a bad request when category is invalid", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/reviews?category=123").expect(400);
    expect(msg).toBe("Bad request. Invalid category.");
  });
  it("404: returns a page not found error when category does not exist", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/reviews?category=bananas").expect(404);
    expect(msg).toBe("Category does not exist.");
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app).get("/api/reviewz").expect(404);
    expect(statusCode).toBe(404);
  });
});

describe("GET /api/reviews/:review_id", () => {
  it('200: returns an object with "review" key and value of object', async () => {
    const {
      body: { review },
    } = await request(app).get("/api/reviews/2").expect(200);
    expect(review).toBeInstanceOf(Object);
  });
  it("200: object contains owner, title, review_id, review_body, designer, review_img_url, category, created_at, votes, comment_count", async () => {
    const {
      body: { review },
    } = await request(app).get("/api/reviews/2").expect(200);
    expect(review).toEqual(
      expect.objectContaining({
        owner: expect.any(String),
        title: expect.any(String),
        review_id: expect.any(Number),
        review_body: expect.any(String),
        designer: expect.any(String),
        review_img_url: expect.any(String),
        category: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        comment_count: expect.any(Number),
      })
    );
  });
  it("400: returns 'Bad request. Invalid ID.' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/reviews/banana").expect(400);
    expect(msg).toBe("Bad request. Invalid ID.");
  });
  it("404: returns 'ID does not exist' when id doesn't exist", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/reviews/55").expect(404);
    expect(msg).toBe("ID does not exist.");
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app).get("/api/reviewz/2").expect(404);
    expect(statusCode).toBe(404);
  });
});

describe("PATCH /api/reviews/:review_id", () => {
  it("200: returns the updated review with increased votes", async () => {
    const { rows } = await db.query(
      `SELECT * FROM reviews WHERE review_id = 2`
    );
    const originalVoteCount = rows[0].votes;
    const {
      body: { review },
    } = await request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: 1 })
      .expect(200);
    expect(review).toBeInstanceOf(Object);
    expect(review.votes).toBe(originalVoteCount + 1);
  });
  it("200: returns the updated review with decreased votes ", async () => {
    const { rows } = await db.query(
      `SELECT * FROM reviews WHERE review_id = 2`
    );
    const originalVoteCount = rows[0].votes;
    const {
      body: { review },
    } = await request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: -10 })
      .expect(200);
    expect(review).toBeInstanceOf(Object);
    expect(review.votes).toBe(originalVoteCount - 10);
  });
  it("200: returns the unaltered review if 'inc_votes' key does not exist", async () => {
    const {
      body: { review },
    } = await request(app)
      .patch("/api/reviews/2")
      .send({ inc_votez: 1 })
      .expect(200);
    const { rows } = await db.query(
      "SELECT * FROM reviews WHERE review_id = 2"
    );
    expect(review.votes).toEqual(rows[0].votes);
  });
  it("400: returns 'Bad request. Invalid ID' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/reviews/bananas")
      .send({ inc_votes: 1 })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid ID.");
  });
  it("400: returns 'Bad request. Invalid vote.' when post body object value is not a number ", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/reviews/2")
      .send({ inc_votes: "one" })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid vote.");
  });
  it("404: returns 'ID does not exist.' when id doesn't exist", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/reviews/55")
      .send({ inc_votes: 1 })
      .expect(404);
    expect(msg).toBe("ID does not exist.");
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app)
      .patch("/api/reviewz/2")
      .send({ inc_votes: 1 })
      .expect(404);
    expect(statusCode).toBe(404);
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  it("200: returns an array of comments", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/reviews/2/comments").expect(200);
    expect(comments).toBeInstanceOf(Array);
  });
  it("200: objects in array contain comment_id, votes, created_at, author, and body", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/reviews/2/comments").expect(200);
    expect(comments).toHaveLength(3);
    comments.forEach((comment) => {
      expect(comment).toEqual(
        expect.objectContaining({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
        })
      );
    });
  });
  it("400: returns 'Bad request. Invalid ID' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/reviews/bananas/comments").expect(400);
    expect(msg).toBe("Bad request. Invalid ID.");
  });
  it("404: returns 'ID does not exist.' when id doesn't exist", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/reviews/100/comments").expect(404);
    expect(msg).toBe("ID does not exist.");
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  it("201: returns the new comment", async () => {
    const {
      body: { comment },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: "mallionaire", body: "This is a new comment." })
      .expect(201);
    expect(comment).toBeInstanceOf(Object);
    expect(comment.body).toBe("This is a new comment.");
  });
  it("201: object contains comment_id, author, review_id, votes, created_at, and body keys", async () => {
    const {
      body: { comment },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: "mallionaire", body: "This is a new comment." })
      .expect(201);
    expect(comment).toEqual(
      expect.objectContaining({
        comment_id: expect.any(Number),
        author: expect.any(String),
        review_id: expect.any(Number),
        votes: expect.any(Number),
        created_at: expect.any(String),
        body: expect.any(String),
      })
    );
  });
  it("400: returns 'Bad request. Invalid ID' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app)
      .post("/api/reviews/bananas/comments")
      .send({ username: "mallionaire", body: "This is a new comment." })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid ID.");
  });
  it("400: returns 'Bad request. Invalid username' when username is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: 123, body: "This is a new comment." })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid username.");
  });
  it("404: returns a page not found when ID does not exist", async () => {
    const {
      body: { msg },
    } = await request(app)
      .post("/api/reviews/100/comments")
      .send({ username: "mallionaire", body: "This is a new comment." })
      .expect(404);
    expect(msg).toBe("ID does not exist.");
  });
  it("404: returns a page not found when username does not exist", async () => {
    const {
      body: { msg },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: "rick astley", body: "This is a new comment." })
      .expect(404);
    expect(msg).toBe("User does not exist.");
  });
});

describe("GET /api/users", () => {
  it("200: returns an array of all user objects with property of username only", async () => {
    const {
      body: { users },
    } = await request(app).get("/api/users").expect(200);
    expect(users).toBeInstanceOf(Array);
    expect(users).toHaveLength(4);
    users.forEach((user) => {
      expect(user).toEqual(
        expect.objectContaining({
          username: expect.any(String),
        })
      );
    });
  });
  it("200: returns an array of objects sorted by username in ascending order by default", async () => {
    const {
      body: { users },
    } = await request(app).get("/api/users").expect(200);
    expect(users).toBeSortedBy("username", { descending: false });
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app).get("/api/userz").expect(404);
    expect(statusCode).toBe(404);
  });
});

describe("GET /api/users/:username", () => {
  it("200: returns an object with a user property with a single user object", async () => {
    const {
      body: { user },
    } = await request(app).get("/api/users/bainesface").expect(200);
    expect(user).toBeInstanceOf(Object);
    expect(user).toEqual(
      expect.objectContaining({
        username: expect.any(String),
        avatar_url: expect.any(String),
        name: expect.any(String),
      })
    );
  });
  it("400: returns 'Bad request. Invalid username' when username is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/users/123").expect(400);
    expect(msg).toBe("Bad request. Invalid username.");
  });
  it("404: returns a page not found when user does not exist", async () => {
    const {
      body: { msg },
    } = await request(app).get("/api/users/rickastley").expect(404);
    expect(msg).toBe("User does not exist.");
  });
});
