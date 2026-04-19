import axios, { AxiosError } from "axios";
import { storage } from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor - attach token
api.interceptors.request.use(
  async (config) => {
    console.log("📤 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });

    try {
      const token = await storage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("❌ Error getting token:", error);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    const errorData = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      code: (error.response?.data as any)?.code,
      isNetworkError: !error.response,
    };

    console.error("❌ API Error:", errorData);

    // Auto logout jika unauthorized (401)
    if (error.response?.status === 401) {
      console.log("🔓 Unauthorized - removing token");
      await storage.removeToken();
      // Note: Navigation akan ditangani oleh useAuth hook
    }

    return Promise.reject(error);
  },
);
