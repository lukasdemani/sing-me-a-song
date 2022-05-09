import { Router } from "express";
import e2eRouter from "./e2eRouter.js";
import recommendationRouter from "./recommendationRouter.js";

const router = Router();
router.use(recommendationRouter);
if (process.env.NODE_ENV === "test") {
  router.use(e2eRouter);
}
export default router;