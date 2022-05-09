import supertest from "supertest";
import app from "../../src/app.js";
import { prisma } from "../../src/database.js";
import { CreateRecommendationData } from "../../src/services/recommendationService.js";

describe("Sing me a song Integration Tests", () => {
  describe("GET /recommendations", () => {
    it("should return the last 10 recommendations", async () => {

      const response = await supertest(app)
        .get("/recommendations");
      expect(response.status).toEqual(200);
      expect(response.body.length).toBeLessThanOrEqual(10);
    });
  });

  describe("GET /recommendations/:id", () => {
    it("should return 1 recommendation by id", async () => {
      const recommendation = await prisma.recommendation.findFirst({});

      const response = await supertest(app)
        .get(`/recommendations/${recommendation.id}`);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(recommendation);
    });

  });

  describe("GET /recommendations/random", () => {
    it("should return 1 random recommendation", async () => {
      const response = await supertest(app)
        .get(`/recommendations/random`);

      expect(response.status).toEqual(200);
    });

  });

  describe("GET /recommendations/top/:amount", () => {
    it("should return a top list", async () => {
      const amount = '5';
      const response = await supertest(app)
        .get(`/recommendations/top/${amount}`);
      
      expect(response.status).toEqual(200);
      expect(response.body.length).toBeLessThanOrEqual(Number(amount));
    });

  });

  describe("POST /recommendations/:id/upvote", () => {
    it("should increase the recommendation score by 1", async () => {
      const recommendation = await prisma.recommendation.findFirst({});

      const response = await supertest(app)
        .post(`/recommendations/${recommendation.id}/upvote`);

      const updatedRecommendation = await prisma.recommendation.findUnique({
        where: { id: recommendation.id },
      });

      expect(response.status).toEqual(200);
      expect(recommendation.score + 1).toEqual(updatedRecommendation.score);
    });
  });

  describe("POST /recommendations/:id/downvote", () => {
    it("should decrease the recommendation score by -1", async () => {
      const recommendation = await prisma.recommendation.findFirst({});

      const response = await supertest(app)
        .post(`/recommendations/${recommendation.id}/downvote`);

      const updatedRecommendation = await prisma.recommendation.findUnique({
        where: { id: recommendation.id },
      });

      expect(response.status).toEqual(200);
      expect(recommendation.score - 1).toEqual(updatedRecommendation.score);
    });
  });

  describe("POST /recommendations", () => {
    const recommendation: CreateRecommendationData = {
      name: "Lagum, L7NNON, Mart'nália - EITA MENINA",
      youtubeLink: "https://www.youtube.com/watch?v=7sNVqZm-HsA",
    };

    beforeEach(async () => {
      await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
    });

    it("should create a new recommendations given a valid body", async () => {

      const response = await supertest(app)
        .post("/recommendations")
        .send(recommendation);
      const testsWithSameName = await prisma.recommendation.findMany({
        where: {
          name: recommendation.name,
        },
      });

      expect(response.status).toEqual(201);
      expect(testsWithSameName.length).toEqual(1);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
