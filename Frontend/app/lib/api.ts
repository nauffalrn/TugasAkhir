import axios from "axios";
import { API_URL } from "../constants/config";
import { getToken } from "./storage";

console.log("🔧 API Configuration:");
console.log("  - Base URL:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 detik timeout
});

// Auto-attach token
api.interceptors.request.use(
  async (config) => {
    console.log("📤 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("  - Token attached:", token.substring(0, 20) + "...");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Handle errors
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response,
    });

    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Terjadi kesalahan";
    return Promise.reject(new Error(message));
  },
);
