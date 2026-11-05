import { useAppTheme } from "@/lib/appTheme";
import { GlassView } from "expo-glass-effect";
import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

type GlassCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassCard({ children, style }: GlassCardProps) {
  const { isDark } = useAppTheme();
  return (
    <GlassView
      style={[styles.card, style]}
      glassEffectStyle="regular"
      colorScheme="auto"
      tintColor={isDark ? "rgba(123, 225, 59, 0.07)" : "rgba(94, 196, 42, 0.05)"}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    gap: 10,
    overflow: "hidden",
    padding: 16,
  },
});
