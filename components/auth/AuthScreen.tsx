import { BrandLogo } from "@/components/BrandLogo";
import { GlassCard } from "@/components/GlassCard";
import { brand } from "@/lib/brand";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenProps = {
  kicker: string;
  title: string;
  children: ReactNode;
};

export function AuthScreen({ kicker, title, children }: AuthScreenProps) {
  const scheme = useColorScheme() ?? "dark";
  const isDark = scheme === "dark";
  const backgroundColor = isDark ? brand.ink : brand.paper;
  const titleColor = isDark ? brand.paper : brand.ink;
  const kickerColor = brand.lime;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={["top", "left", "right"]}>
      <View style={styles.limeBar} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandLogo style={styles.logo} />
          <Text style={[styles.kicker, { color: kickerColor }]}>{kicker}</Text>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

          <GlassCard style={styles.glassCard}>{children}</GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  limeBar: {
    backgroundColor: brand.lime,
    height: 4,
    width: "100%",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 12,
  },
  logo: {
    width: 168,
    height: 104,
    alignSelf: "flex-start",
  },
  kicker: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.4,
    marginTop: 8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 8,
  },
  glassCard: {
    borderRadius: 28,
    gap: 4,
    marginTop: 8,
    overflow: "hidden",
    padding: 22,
  },
});
