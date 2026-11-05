import { useAppTheme } from "@/lib/appTheme";
import { ScrollView, Text, View } from "react-native";
import type { WeightPoint } from "@/lib/progress";

type Props = {
  points: WeightPoint[];
  goalKg?: number | null;
};

export function WeightChart({ points, goalKg }: Props) {
  const t = useAppTheme();
  if (points.length < 2) {
    return (
      <Text style={{ color: t.colors.textMuted, fontSize: 16, lineHeight: 22 }}>
        Log weight at least twice to see a trend line.
      </Text>
    );
  }

  const values = points.map((point) => point.weightKg);
  const min = Math.min(...values, goalKg ?? values[0]) - 1;
  const max = Math.max(...values, goalKg ?? values[0]) + 1;
  const range = Math.max(1, max - min);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
      {points.map((point) => {
        const height = 80 * ((point.weightKg - min) / range) + 12;
        return (
          <View key={point.id} style={{ alignItems: "center", gap: 6, width: 44 }}>
            <View style={{ height: 92, justifyContent: "flex-end" }}>
              <View
                style={{
                  width: 28,
                  height,
                  borderRadius: 8,
                  backgroundColor: t.colors.accent,
                }}
              />
            </View>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>{point.loggedOn.slice(5)}</Text>
            <Text style={{ color: t.colors.text, fontSize: 13, fontWeight: "600" }}>
              {point.weightKg.toFixed(1)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
