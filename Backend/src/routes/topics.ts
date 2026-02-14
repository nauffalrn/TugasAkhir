import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as topicService from "../services/topic.service";
import { success, error } from "../utils/response";

export const topicsRouter = Router();

topicsRouter.get("/", requireAuth, async (_req, res) => {
  try {
    const topics = await topicService.getAllTopics();
    return success(res, { topics });
  } catch (err: any) {
    return error(res, err.code || "INTERNAL_ERROR", err.message, 500);
  }
});

topicsRouter.get("/:slug", requireAuth, async (req, res) => {
  try {
    const topic = await topicService.getTopicBySlug(req.params.slug);
    return success(res, { topic });
  } catch (err: any) {
    return error(res, err.code || "INTERNAL_ERROR", err.message, err.code === "NOT_FOUND" ? 404 : 500);
  }
});