import { Request, Response } from "express";
import { recommendationService } from "../services/recommendationService.js";

async function truncate(req: Request, res: Response) {
  await recommendationService.truncate();
  res.sendStatus(200);
}

export default {
  truncate,
};
