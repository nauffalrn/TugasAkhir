import { createApp } from "./app";
import { env } from "./config/env";

console.log("🚀 Booting server...");

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});