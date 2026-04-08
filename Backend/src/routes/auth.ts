import { Router } from "express";
import * as authService from "../services/auth.service";
import { error, success } from "../utils/response";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    return error(res, "BAD_REQUEST", "Email dan password wajib diisi", 400);
  }
  if (password.length < 6) {
    return error(res, "BAD_REQUEST", "Password minimal 6 karakter", 400);
  }
  if (username && username.length < 3) {
    return error(res, "BAD_REQUEST", "Username minimal 3 karakter", 400);
  }

  try {
    const data = await authService.registerUser(email, password, username);
    return success(res, data);
  } catch (err: any) {
    const statusCode =
      err.code === "EMAIL_EXISTS" || err.code === "USERNAME_EXISTS" ? 409 : 500;
    return error(res, err.code || "INTERNAL_ERROR", err.message, statusCode);
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, "BAD_REQUEST", "Email dan password wajib diisi", 400);
  }

  try {
    const result = await authService.loginUser(email, password);
    return success(res, result);
  } catch (err: any) {
    const statusCode = err.code === "INVALID_LOGIN" ? 401 : 500;
    return error(res, err.code || "INTERNAL_ERROR", err.message, statusCode);
  }
});
