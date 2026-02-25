import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { router } from "expo-router";
import { api } from "../lib/api";
import { storage } from "../lib/storage";

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check token on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    console.log("🔐 Checking authentication...");
    try {
      const token = await storage.getToken();
      if (token) {
        console.log("  - Token found, fetching user profile");
        const res = await api.get("/profile/me");
        setUser(res.data.data);
        console.log("  - User authenticated:", res.data.data.email);
      } else {
        console.log("  - No token found");
      }
    } catch (error) {
      console.error("  - Auth check failed:", error);
      await storage.removeToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    console.log("🔑 Login attempt:", email);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: userData } = res.data.data;

      await storage.setToken(token);
      setUser(userData);

      // Navigate to tabs setelah login sukses
      router.replace("/tabs/materi");
      console.log("✅ Login successful:", userData.email);
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  }

  async function register(email: string, password: string, username: string) {
    console.log("📝 Register attempt:", { email, username });
    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        username,
      });
      const { token, user: userData } = res.data.data;

      await storage.setToken(token);
      setUser(userData);

      // Navigate to tabs setelah register sukses
      router.replace("/tabs/materi");
      console.log("✅ Registration successful, auto-login...");
      // Auto-login setelah register
      // await login(email, password);
    } catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      console.log("👋 Logout");

      // 1. Hapus token dari storage
      await storage.removeToken();

      // 2. Reset user state
      setUser(null);

      // 3. Navigate ke login screen
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
