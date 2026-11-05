import { brand } from "@/lib/brand";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/lib/auth";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  const base = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: isDark ? brand.ink : brand.paper,
      card: isDark ? brand.ink : brand.paper,
      text: isDark ? brand.paper : brand.ink,
      border: isDark ? brand.lineDark : brand.lineLight,
      primary: brand.lime,
    },
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="exercise/[id]" />
            <Stack.Screen name="programmes" />
            <Stack.Screen name="library" />
            <Stack.Screen name="workout/[id]" />
            <Stack.Screen name="workout/complete" />
            <Stack.Screen name="workout/history" />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
