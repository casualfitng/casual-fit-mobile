import { BrandLogo } from "@/components/BrandLogo";
import { brand } from "@/lib/brand";
import { GlassView } from "expo-glass-effect";
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

type OnboardingShellProps = {
  kicker: string;
  title: string;
  hint?: string;
  progress?: { current: number; total: number };
  children: ReactNode;
  footer?: ReactNode;
};

export function OnboardingShell({
  kicker,
  title,
  hint,
  progress,
  children,
  footer,
}: OnboardingShellProps) {
  const scheme = useColorScheme() ?? "dark";
  const isDark = scheme === "dark";
  const backgroundColor = isDark ? brand.ink : brand.paper;
  const titleColor = isDark ? brand.paper : brand.ink;
  const ratio = progress ? Math.min(1, progress.current / progress.total) : 0;

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
          {progress ? (
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: isDark ? brand.lineDark : brand.lineLight },
              ]}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: progress.total, now: progress.current }}
            >
              <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
            </View>
          ) : null}

          <Text style={styles.kicker}>{kicker}</Text>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}

          <GlassView
            style={styles.glassCard}
            glassEffectStyle="regular"
            colorScheme="auto"
            tintColor={isDark ? "rgba(123, 225, 59, 0.08)" : "rgba(94, 196, 42, 0.06)"}
          >
            {children}
          </GlassView>

          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function OnboardingLogo() {
  return <BrandLogo style={styles.logo} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  limeBar: { backgroundColor: brand.lime, height: 4, width: "100%" },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 10,
  },
  progressTrack: {
    borderRadius: 999,
    height: 6,
    marginBottom: 4,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    backgroundColor: brand.lime,
    borderRadius: 999,
    height: "100%",
  },
  logo: {
    alignSelf: "flex-start",
    height: 72,
    resizeMode: "contain",
    width: 120,
  },
  kicker: {
    color: brand.lime,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  hint: {
    color: brand.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  glassCard: {
    borderRadius: 28,
    gap: 6,
    marginTop: 6,
    overflow: "hidden",
    padding: 20,
  },
});
