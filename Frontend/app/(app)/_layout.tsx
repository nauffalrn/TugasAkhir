import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Tab navigation dan sub-screens akan muncul di sini */}
    </Stack>
  );
}