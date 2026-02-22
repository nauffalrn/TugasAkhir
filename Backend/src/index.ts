import { createApp } from "./app";

console.log("🚀 Booting server...");

const app = createApp();

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"; // Penting! Jangan 'localhost'

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`📡 Network: http://192.168.100.5:${PORT}`);
});
