import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/lib/appTheme";
import { Text } from "react-native";

export default function NutritionScreen() {
  const t = useAppTheme();
  return (
    <Screen scroll label="Food" title="Nutrition" body="Log meals and hit your targets.">
      <GlassCard>
        <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700", lineHeight: 24 }}>
          Coming in the next milestone
        </Text>
        <Text style={{ color: t.colors.textMuted, fontSize: 16, lineHeight: 24 }}>
          Your calorie target and daily log will show here — Nigerian, British, and international
          foods from the same ledger as the website promises.
        </Text>
      </GlassCard>
    </Screen>
  );
}
