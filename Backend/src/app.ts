import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth";
import { profileRouter } from "./routes/profiles";
import { quizRouter } from "./routes/quiz";
import topicsRouter from "./routes/topics";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Server is running" });
  });

  app.use("/auth", authRouter);
  app.use("/topics", topicsRouter);
  app.use("/quiz", quizRouter);
  app.use("/profile", profileRouter);

  return app;
}
