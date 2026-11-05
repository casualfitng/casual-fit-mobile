import { useAppTheme } from "@/lib/appTheme";
import { useAuth } from "@/lib/auth";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Gate() {
  const { status, user } = useAuth();
  const t = useAppTheme();
  if (status === "loading") {
    return <View style={{ flex: 1, backgroundColor: t.colors.background }} />;
  }
  if (status === "signedIn" && !user?.onboardingComplete) {
    return <Redirect href="/(onboarding)" />;
  }
  if (status === "signedIn") return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/login" />;
}
