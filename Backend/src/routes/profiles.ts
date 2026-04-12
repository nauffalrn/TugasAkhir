import { Router } from "express";
import { AuthedRequest } from "../middleware/auth";
import * as profileService from "../services/profile.service";
import { error, success } from "../utils/response";

export const profileRouter = Router();

profileRouter.get("/me", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const data = await profileService.getUserProfile(userId);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.code || "SERVER_ERROR", err.message);
  }
});

profileRouter.get("/badges", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const data = await profileService.getUserBadges(userId);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.code || "SERVER_ERROR", err.message);
  }
});

profileRouter.get("/progress", async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const data = await profileService.getUserProgress(userId);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.code || "SERVER_ERROR", err.message);
  }
});
