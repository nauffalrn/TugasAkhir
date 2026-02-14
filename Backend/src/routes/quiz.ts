import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import * as quizService from "../services/quiz.service";
import { success, error } from "../utils/response";

export const quizRouter = Router();

quizRouter.post("/start", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  const bodySchema = z.object({
    topic_slug: z.string(),
    level: z.number().int().min(1).max(4),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return error(res, "BAD_REQUEST", parsed.error.message, 400);
  }

  try {
    const result = await quizService.startQuiz(userId, parsed.data.topic_slug, parsed.data.level);
    return success(res, result);
  } catch (err: any) {
    const status =
      err.code === "TOPIC_NOT_FOUND" ? 404 : err.code === "LEVEL_LOCKED" ? 403 : err.code === "INSUFFICIENT_QUESTIONS" ? 500 : 500;
    return error(res, err.code || "INTERNAL_ERROR", err.message, status);
  }
});

quizRouter.post("/submit", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  const bodySchema = z.object({
    attempt_id: z.string().uuid(),
    answers: z.array(
      z.object({
        question_id: z.string().uuid(),
        selected_index: z.number().int().min(0).max(3),
      })
    ),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return error(res, "BAD_REQUEST", parsed.error.message, 400);
  }

  try {
    const result = await quizService.submitQuiz(userId, parsed.data.attempt_id, parsed.data.answers);
    return success(res, result);
  } catch (err: any) {
    const status =
      err.code === "ATTEMPT_NOT_FOUND" ? 404 : err.code === "FORBIDDEN" ? 403 : err.code === "ALREADY_SUBMITTED" ? 400 : 500;
    return error(res, err.code || "INTERNAL_ERROR", err.message, status);
  }
});