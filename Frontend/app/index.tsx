import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "./_hooks/useAuth";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    SplashScreen.hideAsync();

    if (isAuthenticated) {
      router.replace("/(app)/(tabs)/materi");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return null;
}
