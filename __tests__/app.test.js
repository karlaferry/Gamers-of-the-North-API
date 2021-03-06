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
    expect(categories).toBeInstanceOf(Array);
    expect(categories).toHaveLength(4);
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

describe("GET /api/comments/:comment_id", () => {
  it('200: returns an object with "comment" key and value of object with required keys', async () => {
    const {
      body: { comment },
    } = await request(app).get("/api/comments/1").expect(200);
    expect(comment).toBeInstanceOf(Object);
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

describe("GET /api/comments/author/:author", () => {
  it('200: returns an object with "comment" key and value of object with required keys ', async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/comments/user/bainesface").expect(200);
    expect(comments[0]).toBeInstanceOf(Object);
    expect(comments).toHaveLength(2);
    comments.forEach((comment) => {
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

describe("PATCH /api/comments/:comment_id/body", () => {
  it("201: returns the updated comment", async () => {
    const {
      body: { comment },
    } = await request(app)
      .patch("/api/comments/1/body")
      .send({ body: "New comment body here." })
      .expect(201);
    expect(comment.body).toBe("New comment body here.");
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
  it("201: returns the unchanged comment if patch body is empty", async () => {
    const {
      body: { comment },
    } = await request(app).patch("/api/comments/1/body").send().expect(201);
    const commentBody = "I loved this game too!";
    expect(comment.body).toBe(commentBody);
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
  it("400: returns 'Bad request. Invalid ID.' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/comments/bananas/body")
      .send({ body: "New comment body here." })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid ID.");
  });
  it("404: returns 'ID does not exist' when id doesn't exist", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/comments/99999/body")
      .send({ body: "New comment body here." })
      .expect(404);
    expect(msg).toBe("ID does not exist.");
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app)
      .patch("/api/comments/2/bodyz")
      .send({ body: "New comment body here." })
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
  it('200: returns an object with "reviews" key with array of objects with required keys', async () => {
    const {
      body: { reviews },
    } = await request(app).get("/api/reviews").expect(200);
    expect(reviews).toBeInstanceOf(Array);
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
  it("200: returns an array of objects with limit", async () => {
    const {
      body: { reviews },
    } = await request(app)
      .get("/api/reviews?sort_by=votes&order=asc&limit=10&p=0")
      .expect(200);
    expect(reviews.length <= 10).toBe(true);
  });
  it("200: returns an array of all objects reviews if length is less than limit", async () => {
    const {
      body: { reviews },
    } = await request(app)
      .get("/api/reviews?sort_by=votes&order=asc&limit=30&p=0")
      .expect(200);
    expect(reviews.length === 13).toBe(true);
  });
  it("200: returns an array of objects reviews page 2", async () => {
    const {
      body: { reviews },
    } = await request(app)
      .get("/api/reviews?sort_by=votes&order=asc&limit=12&p=1")
      .expect(200);
    expect(reviews.length === 1).toBe(true);
  });
  it("200: Offset defaults to 0 if not specified", async () => {
    const {
      body: { reviews },
    } = await request(app)
      .get("/api/reviews?sort_by=votes&order=asc&limit=12")
      .expect(200);
    expect(reviews.length === 12).toBe(true);
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
  it('200: returns an object with "review" key and value of object with required keys', async () => {
    const {
      body: { review },
    } = await request(app).get("/api/reviews/1").expect(200);
    expect(review).toBeInstanceOf(Object);
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
  it("200: returns the unaltered review if body does not exist", async () => {
    const {
      body: { review },
    } = await request(app).patch("/api/reviews/2").send().expect(200);
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

describe("PATCH /api/reviews/:review_id/body", () => {
  it("201: returns the updated review", async () => {
    const {
      body: { review },
    } = await request(app)
      .patch("/api/reviews/2/body")
      .send({ review_body: "New review body here." })
      .expect(201);
    expect(review.review_body).toBe("New review body here.");
    expect(review).toEqual(
      expect.objectContaining({
        review_id: expect.any(Number),
        title: expect.any(String),
        review_body: expect.any(String),
        designer: expect.any(String),
        review_img_url: expect.any(String),
        votes: expect.any(Number),
        category: expect.any(String),
        owner: expect.any(String),
        created_at: expect.any(String),
        comment_count: expect.any(Number),
      })
    );
  });
  it("201: returns the unchanged review if patch body is empty", async () => {
    const {
      body: { review },
    } = await request(app).patch("/api/reviews/2/body").send().expect(201);
    const reviewBody = "Fiddly fun for all the family";
    expect(review.review_body).toBe(reviewBody);
    expect(review).toEqual(
      expect.objectContaining({
        review_id: expect.any(Number),
        title: expect.any(String),
        review_body: expect.any(String),
        designer: expect.any(String),
        review_img_url: expect.any(String),
        votes: expect.any(Number),
        category: expect.any(String),
        owner: expect.any(String),
        created_at: expect.any(String),
        comment_count: expect.any(Number),
      })
    );
  });
  it("400: returns 'Bad request. Invalid ID.' when id is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/reviews/bananas/body")
      .send({ review_body: "New review body here." })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid ID.");
  });
  it("404: returns 'ID does not exist' when id doesn't exist", async () => {
    const {
      body: { msg },
    } = await request(app)
      .patch("/api/reviews/99999/body")
      .send({ review_body: "New review body here." })
      .expect(404);
    expect(msg).toBe("ID does not exist.");
  });
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app)
      .patch("/api/reviews/2/bodyz")
      .send({ review_body: "New review body here." })
      .expect(404);
    expect(statusCode).toBe(404);
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  it("200: returns an array of comments with required object keys", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/reviews/2/comments").expect(200);
    expect(comments).toBeInstanceOf(Array);
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

  it("200: returns an empty array of comments if review_id does not have comments", async () => {
    const {
      body: { comments },
    } = await request(app).get("/api/reviews/9/comments").expect(200);
    expect(comments).toHaveLength(0);
  });

  it("200 returns a sorted array", async () => {
    const {
      body: { comments },
    } = await request(app)
      .get("/api/reviews/2/comments?sort_by=author&order=asc")
      .expect(200);
    expect(comments).toBeSortedBy("author", { descending: false });
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
  it("201: returns the new comment, ignores unnecessary properties", async () => {
    const {
      body: { comment },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({
        username: "mallionaire",
        body: "This is a new comment.",
        date: "today",
      })
      .expect(201);
    expect(comment).toBeInstanceOf(Object);
    expect(comment.body).toBe("This is a new comment.");
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
  it("400: returns 'Bad request. Incomplete post body.' when post body is incomplete", async () => {
    const {
      body: { msg: noUser },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({ username: "mallionaire" })
      .expect(400);
    expect(noUser).toBe("Bad request. Incomplete post body.");
    const {
      body: { msg: noPostBody },
    } = await request(app)
      .post("/api/reviews/2/comments")
      .send({ body: "This is a new comment." })
      .expect(400);
    expect(noPostBody).toBe("Bad request. Incomplete post body.");
    const {
      body: { msg: noSend },
    } = await request(app).post("/api/reviews/2/comments").send().expect(400);
    expect(noSend).toBe("Bad request. Incomplete post body.");
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

describe("POST /api/users", () => {
  it("201: returns the new user, ignores unnecessary properties", async () => {
    const {
      body: { user },
    } = await request(app)
      .post("/api/users")
      .send({
        username: "zelda",
        avatar_url: "https://avatarfiles.alphacoders.com/123/123266.png",
        name: "princess zelda",
        age: 22,
      })
      .expect(201);
    expect(user).toBeInstanceOf(Object);
    expect(user).toEqual(
      expect.objectContaining({
        username: expect.any(String),
        avatar_url: expect.any(String),
        name: expect.any(String),
      })
    );
  });
  it("400: returns 'Bad request. Incomplete post body.' when post body is incomplete", async () => {
    const {
      body: { msg },
    } = await request(app)
      .post("/api/users")
      .send({ username: "zelda" })
      .expect(400);
    expect(msg).toBe("Bad request. Incomplete post body.");
  });
  it("400: returns 'Bad request. Invalid username' when username is in the wrong data type", async () => {
    const {
      body: { msg },
    } = await request(app)
      .post("/api/users")
      .send({
        username: 123,
        avatar_url: "https://avatarfiles.alphacoders.com/123/123266.png",
        name: "princess zelda",
      })
      .expect(400);
    expect(msg).toBe("Bad request. Invalid username.");
  });
  it("400: returns 'Username already taken", async () => {
    const {
      body: { msg },
    } = await request(app)
      .post("/api/users")
      .send({
        username: "mallionaire",
        avatar_url: "https://avatarfiles.alphacoders.com/123/123266.png",
        name: "princess zelda",
      })
      .expect(400);
    expect(msg).toBe("Username already taken.");
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
