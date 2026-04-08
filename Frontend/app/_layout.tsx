import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "./_providers/auth-provider";
import * as SplashScreen from "expo-splash-screen";
import { LogBox } from "react-native"; // ✅ Impor LogBox

LogBox.ignoreAllLogs();

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Routes akan muncul di sini */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
