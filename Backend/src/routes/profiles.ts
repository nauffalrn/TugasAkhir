import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import * as profileService from "../services/profile.service";
import { success, error } from "../utils/response";

export const profileRouter = Router();

profileRouter.get("/me", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  try {
    const profile = await profileService.getUserProfile(userId);
    return success(res, profile);
  } catch (err: any) {
    return error(res, err.code || "INTERNAL_ERROR", err.message, err.code === "USER_NOT_FOUND" ? 404 : 500);
  }
});

profileRouter.get("/badges", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  try {
    const badges = await profileService.getUserBadges(userId);
    return success(res, { badges });
  } catch (err: any) {
    return error(res, err.code || "INTERNAL_ERROR", err.message, 500);
  }
});

profileRouter.get("/progress", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  try {
    const progress = await profileService.getUserProgress(userId);
    return success(res, { progress });
  } catch (err: any) {
    return error(res, err.code || "INTERNAL_ERROR", err.message, 500);
  }
});