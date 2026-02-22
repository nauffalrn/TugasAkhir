import { Router } from "express";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import * as quizService from "../services/quiz.service";
import { error, success } from "../utils/response";

export const quizRouter = Router();

quizRouter.post("/start", requireAuth, async (req, res) => {
  try {
    const { topic_slug, level } = req.body;
    if (!topic_slug || !level) {
      return error(res, "VALIDATION_ERROR", "topic_slug and level required");
    }
    const userId = (req as AuthedRequest).userId;
    const data = await quizService.startQuiz(userId, topic_slug, level);
    return success(res, data);
  } catch (err: any) {
    console.error("Error /quiz/start:", err);
    const statusCode = err.code === "LEVEL_LOCKED" ? 403 : 500;
    return error(res, err.code || "SERVER_ERROR", err.message, statusCode);
  }
});

quizRouter.post("/submit", requireAuth, async (req, res) => {
  try {
    const { attempt_id, topic_id, level, answers } = req.body;
    if (!attempt_id || !topic_id || !level || !answers) {
      return error(
        res,
        "INVALID_INPUT",
        "attempt_id, topic_id, level, dan answers wajib",
        400,
      );
    }
    const userId = (req as AuthedRequest).userId;
    const data = await quizService.submitQuiz(
      userId,
      attempt_id,
      topic_id,
      level,
      answers,
    );
    return success(res, data);
  } catch (err: any) {
    console.error("Error /quiz/submit:", err);
    return error(res, err.code || "SERVER_ERROR", err.message, 500);
  }
});
