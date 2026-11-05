import { BrandLogo } from "@/components/BrandLogo";
import { tabBarScrollPadding } from "@/components/navigation/GlassTabBar";
import { useTabBarLayoutMode } from "@/lib/tabBarLayoutContext";
import { useAppTheme } from "@/lib/appTheme";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenProps = {
  label: string;
  title: string;
  body?: string;
  showLogo?: boolean;
  scroll?: boolean;
  children?: ReactNode;
};

export function Screen({
  label,
  title,
  body,
  showLogo = false,
  scroll = false,
  children,
}: ScreenProps) {
  const t = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarMode = useTabBarLayoutMode();
  const bottomPad =
    tabBarMode === "native" ? Math.max(insets.bottom, 12) + 12 : tabBarScrollPadding(insets.bottom);
  const content = (
    <>
      {showLogo ? <BrandLogo style={styles.logo} /> : null}
      <Text style={styles.kicker}>{label}</Text>
      <Text style={[styles.title, { color: t.colors.text }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: t.colors.textMuted }]}>{body}</Text> : null}
      {children}
    </>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: t.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.limeBar} />
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.content, { paddingBottom: bottomPad }]}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  limeBar: {
    backgroundColor: "#7BE13B",
    height: 4,
    width: "100%",
  },
  content: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logo: {
    height: 56,
    marginBottom: 4,
    width: 96,
  },
  kicker: {
    color: "#7BE13B",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 36,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
  },
});
