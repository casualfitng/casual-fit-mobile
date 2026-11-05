import { useAuth } from "@/lib/auth";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function OnboardingLayout() {
  const { status, user } = useAuth();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  if (status === "loading") return null;
  if (status === "signedOut") return <Redirect href="/(auth)/login" />;
  if (user?.onboardingComplete && edit !== "1") return <Redirect href="/(tabs)" />;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}
