import { createApp } from "./app";

console.log("🚀 Booting server...");

const app = createApp();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`📡 Network: http://192.168.100.8:${PORT}`);
});
