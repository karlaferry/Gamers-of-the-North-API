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

describe("GET /api/reviews/:review_id", () => {
  it('200: returns an object with "review" key and value of array', async () => {
    const {
      body: { review },
    } = await request(app).get("/api/reviews/2").expect(200);
    expect(review).toBeInstanceOf(Array);
  });
  it("200: object in array contains owner, title, review_id, review_body, designer, review_img_url, category, created_at, votes, comment_count", async () => {
    const {
      body: { review },
    } = await request(app).get("/api/reviews/2").expect(200);
    expect(review).toHaveLength(1);
    expect(review[0]).toEqual(
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
  describe("200: OK", () => {
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
      expect(review).toBeInstanceOf(Array);
      expect(review).toHaveLength(1);
      expect(review[0].votes).toBe(originalVoteCount + 1);
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
      expect(review).toBeInstanceOf(Array);
      expect(review).toHaveLength(1);
      expect(review[0].votes).toBe(originalVoteCount - 10);
    });
  });
  describe("400: Bad request", () => {
    it("400: returns 'Bad request. Invalid ID' when id is in the wrong data type", async () => {
      const {
        body: { msg },
      } = await request(app)
        .patch("/api/reviews/bananas")
        .send({ inc_votes: 1 })
        .expect(400);
      expect(msg).toBe("Bad request. Invalid ID.");
    });
    it("400: returns 'Bad request. Invalid post body.' when post body object key is invalid", async () => {
      const {
        body: { msg },
      } = await request(app)
        .patch("/api/reviews/2")
        .send({ inc_votez: 1 })
        .expect(400);
      expect(msg).toBe("Bad request. Invalid post body.");
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
  });
  describe("404: Page not found", () => {
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
  it("404: returns a page not found error when path is misspelt", async () => {
    const { statusCode } = await request(app).get("/api/reviewz").expect(404);
    expect(statusCode).toBe(404);
  });
  describe("QUERY", () => {
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
      } = await request(app)
        .get("/api/reviews?category=euro%20game")
        .expect(200);
      expect(reviews).toHaveLength(1);
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
    it("404: returns a page not found error when category does not exist", async () => {
      const {
        body: { msg },
      } = await request(app).get("/api/reviews?category=bananas").expect(404);
      expect(msg).toBe("Category does not exist.");
    });
  });
});
