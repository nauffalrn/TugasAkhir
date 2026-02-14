const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { topicsRouter } from "./routes/topics";
import { quizRouter } from "./routes/quiz";
import { profileRouter } from "./routes/profiles";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json());

  app.use(
    cors({
      origin: env.CORS_ORIGIN
        ? env.CORS_ORIGIN.split(",").map((s) => s.trim())
        : true,
      credentials: true,
    }),
  );

  app.get("/health", (_req: any, res: any) => res.json({ ok: true }));

  app.use("/auth", authRouter);
  app.use("/topics", topicsRouter);
  app.use("/quiz", quizRouter);
  app.use("/profile", profileRouter);

  return app;
}
