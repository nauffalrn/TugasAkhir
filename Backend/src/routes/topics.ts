import express from "express";
import * as topicService from "../services/topic.service";
import { error, success } from "../utils/response";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await topicService.getAllTopics();
    return success(res, data);
  } catch (err: any) {
    return error(res, err.code || "SERVER_ERROR", err.message);
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const topic = await topicService.getTopicBySlug(req.params.slug);
    return success(res, topic);
  } catch (err: any) {
    return error(res, err.code || "SERVER_ERROR", err.message);
  }
});

export default router;
