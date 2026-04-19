import compression from "compression";
import cors from "cors";
import express from "express";
import path from "path";
import { requireAuth } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { profileRouter } from "./routes/profiles";
import { quizRouter } from "./routes/quiz";
import topicsRouter from "./routes/topics";

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  app.use(
    "/images",
    express.static(path.join(__dirname, "..", "public", "images")),
  );
  app.use(express.static(path.join(__dirname, '../public')));


  app.get("/health", (req, res) => {
    res.json({ ok: true, message: "Server is running" });
  });

  // Routes
  app.use("/auth", authRouter);
  app.use("/topics", topicsRouter);
  app.use("/quiz", requireAuth, quizRouter);
  app.use("/profile", requireAuth, profileRouter);

  return app;
}
