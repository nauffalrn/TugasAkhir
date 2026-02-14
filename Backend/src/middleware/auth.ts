import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const jwt = require("jsonwebtoken");

export type AuthedRequest = Request & { userId: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Missing token" } });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    (req as AuthedRequest).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Invalid token" } });
  }
}