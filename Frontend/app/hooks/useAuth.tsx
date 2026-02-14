import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../lib/api";
import { saveToken, getToken, removeToken } from "../lib/storage";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username?: string,
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
      const token = await getToken();
      if (token) {
        console.log("  - Token found, fetching user profile");
        const res = await api.get("/profile/me");
        setUser(res.data.data.user);
        console.log("  - User authenticated:", res.data.data.user.email);
      } else {
        console.log("  - No token found");
      }
    } catch (error) {
      console.error("  - Auth check failed:", error);
      await removeToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    console.log("🔑 Login attempt:", email);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      await saveToken(token);
      setUser(user);
      console.log("✅ Login successful:", user.email);
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  }

  async function register(email: string, password: string, username?: string) {
    console.log("📝 Register attempt:", { email, username });
    try {
      await api.post("/auth/register", { email, password, username });
      console.log("✅ Registration successful, auto-login...");
      // Auto-login setelah register
      await login(email, password);
    } catch (error) {
      console.error("❌ Registration failed:", error);
      throw error;
    }
  }

  async function logout() {
    console.log("👋 Logout");
    await removeToken();
    setUser(null);
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
