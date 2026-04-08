import React, { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../_lib/storage";
import { api } from "../_lib/api";
import { useRouter } from "expo-router";

export interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await storage.getToken();
      if (savedToken) {
        setToken(savedToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
        // Fetch user profile
        try {
          const res = await api.get("/profile/me");
          setUser(res.data.data);
        } catch (err) {
          console.log("Failed to fetch user profile");
          await storage.removeToken();
        }
      }
    } catch (e) {
      console.log("Failed to restore token", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = res.data.data;
      setUser(userData);
      setToken(newToken);
      await storage.setToken(newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      // ✅ FIX: Gunakan path yang benar dengan layout group
      router.replace("/(app)/(tabs)/materi");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
  ) => {
    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        username,
      });
      const { token: newToken, user: userData } = res.data.data;
      setUser(userData);
      setToken(newToken);
      await storage.setToken(newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      // ✅ FIX: Gunakan path yang benar dengan layout group
      router.replace("/(app)/(tabs)/materi");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storage.removeToken();
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common["Authorization"];
      // ✅ FIX: Gunakan path yang benar dengan layout group
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
