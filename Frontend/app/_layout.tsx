import { Stack } from "expo-router";
import { AuthProvider } from "./hooks/useAuth";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Galano: require("../assets/fonts/Galano-Grotesque.otf"),
    "Galano-Medium": require("../assets/fonts/Galano-Grotesque-Medium.otf"),
    "Galano-SemiBold": require("../assets/fonts/Galano-Grotesque-Semi-Bold.otf"),
    "Galano-Bold": require("../assets/fonts/Galano-Grotesque-Bold.otf"),
    "Galano-ExtraBold": require("../assets/fonts/Galano-Grotesque-Extra-Bold.otf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="materi" />
        <Stack.Screen name="kuis" />
      </Stack>
    </AuthProvider>
  );
}
