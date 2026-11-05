import { theme as shared } from "./theme";
import { useColorScheme } from "react-native";
import { brand } from "./brand";

export function useAppTheme() {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  return {
    isDark,
    colors: {
      background: isDark ? brand.ink : brand.paper,
      text: isDark ? brand.paper : brand.ink,
      textMuted: brand.muted,
      accent: brand.lime,
      accentDeep: brand.limeDeep,
      onAccent: brand.onLime,
      border: isDark ? brand.lineDark : brand.lineLight,
      surface: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
      error: brand.error,
    },
    space: shared.space,
    type: shared.type,
  };
}
