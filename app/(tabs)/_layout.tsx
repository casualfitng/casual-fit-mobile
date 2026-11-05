import { JsTabsLayout } from "@/components/navigation/JsTabsLayout";
import { brand } from "@/lib/brand";
import { useAuth } from "@/lib/auth";
import { useAppTheme } from "@/lib/appTheme";
import { TabBarLayoutProvider } from "@/lib/tabBarLayoutContext";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

function NativeTabsLayout() {
  const t = useAppTheme();

  return (
    <NativeTabs
      minimizeBehavior="automatic"
      tintColor={brand.lime}
      iconColor={{
        default: t.colors.textMuted,
        selected: brand.lime,
      }}
      labelStyle={{
        default: { color: t.colors.textMuted, fontSize: 10, fontWeight: "600" },
        selected: { color: t.colors.text, fontSize: 10, fontWeight: "600" },
      }}
      disableTransparentOnScrollEdge={false}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout">
        <NativeTabs.Trigger.Icon sf={{ default: "dumbbell", selected: "dumbbell.fill" }} />
        <NativeTabs.Trigger.Label>Workout</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nutrition">
        <NativeTabs.Trigger.Icon sf={{ default: "fork.knife", selected: "fork.knife" }} />
        <NativeTabs.Trigger.Label>Food</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.line.uptrend.xyaxis", selected: "chart.line.uptrend.xyaxis" }}
        />
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function TabLayout() {
  const { status, user } = useAuth();
  const useNativeTabs = Platform.OS === "ios" || Platform.OS === "android";

  if (status === "loading") return null;
  if (status === "signedOut") return <Redirect href="/(auth)/login" />;
  if (user && !user.onboardingComplete) return <Redirect href="/(onboarding)" />;

  return (
    <TabBarLayoutProvider mode={useNativeTabs ? "native" : "floating"}>
      {useNativeTabs ? <NativeTabsLayout /> : <JsTabsLayout />}
    </TabBarLayoutProvider>
  );
}
