import dotenv from "dotenv";
import "dotenv/config";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  JWT_SECRET: z.string().min(16),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
  CORS_ORIGIN: z.string().optional(),
});

export const env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (err) {
    console.error("❌ ENV ERROR");
    console.error(err);
    process.exit(1);
  }
})();

export const API_URL = process.env.API_URL || "http://192.168.100.9:3001";
