import { Recommendation } from ".prisma/client";
import { prisma } from "../../src/database.js";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { CreateRecommendationData, recommendationService } from "../../src/services/recommendationService.js";
import { notFoundError } from "../../src/utils/errorUtils.js";
import exp from "constants";

describe("Recommendation service unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should insert a new recommendation", async () => {
    const recommendation: CreateRecommendationData = {
      name: "Gilsons - Vem de Lá (Visualizer)",
      youtubeLink: "https://www.youtube.com/watch?v=weq7lsYr3aY",
    };

    jest
      .spyOn(recommendationRepository, "findByName")
      .mockResolvedValue(null);
    const recommendationRepositoryInsert = jest
      .spyOn(recommendationRepository, "create")
      .mockResolvedValue(null);

    await recommendationService.insert(recommendation);

    expect(recommendationRepositoryInsert).toBeCalledTimes(1);
  })

  it("should verify if the name is unique", async () => {
    const newRecommendation: CreateRecommendationData = {
      name: "Gilsons - Vem de Lá (Visualizer)",
      youtubeLink: "https://www.youtube.com/watch?v=weq7lsYr3aY",
    };

    const recommendation: Recommendation = {
      id: 1,
      name: "Gilsons - Vem de Lá (Visualizer)",
      youtubeLink: "https://www.youtube.com/watch?v=weq7lsYr3aY",
      score: 100
    };

    let result = "";
    
    jest.spyOn(recommendationRepository, "findByName").mockResolvedValue(recommendation);
    
    try 
      {await recommendationService.insert(newRecommendation);}
    catch (error) {
      result = error.message;
    }

    expect(result).toEqual("Recommendations names must be unique");
  })

  it("should increase score by 1", async () => {
    const recommendation = await prisma.recommendation.findFirst({});
    jest.spyOn(recommendationService, "getById").mockResolvedValue(recommendation);

    const recommendationRepositoryUpvote = jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValue(recommendation);

    await recommendationService.upvote(recommendation.id);

    expect(recommendationRepositoryUpvote).toBeCalledTimes(1);
  });

  it("should decrease score by 1", async () => {
    const result = await prisma.recommendation.findFirst({ where: { score: { gt: 0 } } });

    jest.spyOn(recommendationService, "getById").mockResolvedValue(result);

    const recommendationRepositoryDownvote = jest
      .spyOn(recommendationRepository, "updateScore")
      .mockResolvedValue(result);

    await recommendationService.downvote(result.id);

    expect(recommendationRepositoryDownvote).toBeCalledTimes(1);
  });

  it("should remove recommendation if score less than 5 points", async () => {
    const recommendation: Recommendation = {
      id: 200,
      name: "Gilsons - Vem de Lá (Visualizer)",
      youtubeLink: "https://www.youtube.com/watch?v=weq7lsYr3aY",
      score: -6
    };

    jest.spyOn(recommendationService, "getById").mockResolvedValue(null);

    jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue(null);

    const removeRecommendation = jest.spyOn(recommendationRepository, "remove");
 
    await recommendationService.downvote(recommendation.id);
    expect(removeRecommendation).toBeCalledTimes(1);

  });

  // it ("should return error if score filter doesnt exist", async () => {
  //   let result = "";
  //   jest.spyOn(recommendationService, "getByScore").mockResolvedValue(null);
    
  //   try {
  //     await recommendationService.getRandom()
  //   }catch(error){
  //     result = error.type;
  //   }

  //   expect(result).toEqual("not_found");
  // });

  // it("should get a recommendation by id", async () => {
  //   const recommendation: CreateRecommendationData = {
  //     name: "Gilsons - Vem de Lá (Visualizer)",
  //     youtubeLink: "https://www.youtube.com/watch?v=weq7lsYr3aY",
  //   };
  //   const createdRecommendation = await prisma.recommendation.findFirst({ where: { name: recommendation.name } });
   
  //   jest.spyOn(recommendationRepository, "find").mockResolvedValue(null);

  //   const result = await recommendationService.getById(createdRecommendation.id);
  
  //   expect(result).toEqual(createdRecommendation);
  // });

  it("should get all the recommendations", async () => {
    const recommendations = await prisma.recommendation.findMany({});

    const result = await recommendationService.get();

    expect(recommendations.length).toEqual(result.length);
  })

  it("should get recommendations by score", async () => {

    const result = jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);

    await recommendationService.getByScore("gt");

    expect(result).toBeCalledTimes(2);
  })

  it("should get top list", async () => {
    const take = 3;
    const topRecommendations = await prisma.recommendation.findMany({ orderBy: { score: "desc" }, take, });

    const result = await recommendationService.getTop(take);

    expect(result).toEqual(topRecommendations);
  })

  it("should return gt when random <0.7", async () => {
    const result = recommendationService.getScoreFilter(0.5);

    expect(result).toEqual("gt");
  })

  it("should return lte when random >=0.7", async () => {
    const result = recommendationService.getScoreFilter(0.7);

    expect(result).toEqual("lte");
  })

  it("should execute fuction truncate", async () => {
    const result = jest.spyOn(recommendationRepository, "truncate").mockResolvedValue(null);

    await recommendationService.truncate();

    expect(result).toBeCalledTimes(1);
  })
});

