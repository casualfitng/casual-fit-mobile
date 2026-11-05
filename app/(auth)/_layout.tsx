import { useAuth } from "@/lib/auth";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  const { status } = useAuth();
  if (status === "loading") return null;
  if (status === "signedIn") return <Redirect href="/(tabs)" />;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot" />
        <Stack.Screen name="reset" />
      </Stack>
    </>
  );
}
