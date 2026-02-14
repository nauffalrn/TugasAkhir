import { Router } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { success, error } from "../utils/response";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3).max(24).optional(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return error(res, "BAD_REQUEST", parsed.error.message, 400);
  }

  try {
    const user = await authService.registerUser(parsed.data.email, parsed.data.password, parsed.data.username);
    return success(res, { user });
  } catch (err: any) {
    return error(res, err.code || "INTERNAL_ERROR", err.message, err.code === "EMAIL_EXISTS" || err.code === "USERNAME_EXISTS" ? 409 : 500);
  }
});

authRouter.post("/login", async (req, res) => {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return error(res, "BAD_REQUEST", parsed.error.message, 400);
  }

  try {
    const result = await authService.loginUser(parsed.data.email, parsed.data.password);
    return success(res, result);
  } catch (err: any) {
    return error(res, err.code || "INTERNAL_ERROR", err.message, err.code === "INVALID_LOGIN" ? 401 : 500);
  }
});