import { GlassCard } from "@/components/GlassCard";
import { brand } from "@/lib/brand";
import { useAppTheme } from "@/lib/appTheme";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const t = useAppTheme();
  return (
    <GlassCard style={styles.tile}>
      <Text style={[styles.kicker, { color: t.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: t.colors.text }]} numberOfLines={1}>
        {value}
      </Text>
      {hint ? <Text style={[styles.hint, { color: t.colors.textMuted }]}>{hint}</Text> : null}
    </GlassCard>
  );
}

export function MacroBar({
  label,
  current,
  target,
  unit,
}: {
  label: string;
  current: number;
  target: number | null;
  unit: string;
}) {
  const t = useAppTheme();
  const ratio = target && target > 0 ? Math.min(1, current / target) : 0;
  return (
    <View style={styles.macro}>
      <View style={styles.macroHead}>
        <Text style={[styles.macroLabel, { color: t.colors.text }]}>{label}</Text>
        <Text style={[styles.macroValue, { color: t.colors.textMuted }]}>
          {target == null ? `${current}${unit}` : `${current} / ${target}${unit}`}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: t.colors.surface }]}>
        <View style={[styles.fill, { width: `${Math.round(ratio * 100)}%` }]} />
      </View>
    </View>
  );
}

export function WeekPips({
  days,
}: {
  days: { weekday: string; isRest: boolean; completed: boolean; isToday: boolean }[];
}) {
  const t = useAppTheme();
  return (
    <View style={styles.pips}>
      {days.map((day) => {
        const letter = day.weekday.slice(0, 1).toUpperCase();
        const filled = day.completed && !day.isRest;
        return (
          <View key={day.weekday} style={styles.pipCol}>
            <View
              style={[
                styles.pip,
                {
                  backgroundColor: filled ? brand.lime : "transparent",
                  borderColor: day.isToday ? brand.lime : t.colors.border,
                },
              ]}
            >
              <Text style={{ color: filled ? brand.onLime : t.colors.text, fontSize: 12, fontWeight: "700" }}>
                {day.isRest ? "·" : letter}
              </Text>
            </View>
            <Text style={[styles.pipLabel, { color: day.isToday ? t.colors.text : t.colors.textMuted }]}>
              {letter}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function RowLink({ label, detail, onPress }: { label: string; detail?: string; onPress: () => void }) {
  const t = useAppTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <GlassCard style={styles.row}>
        <Text style={[styles.rowLabel, { color: t.colors.text }]}>{label}</Text>
        {detail ? <Text style={{ color: t.colors.textMuted, fontSize: 14 }}>{detail}</Text> : null}
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, gap: 4, padding: 14 },
  kicker: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  value: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  hint: { fontSize: 12, lineHeight: 16 },
  macro: { gap: 6 },
  macroHead: { flexDirection: "row", justifyContent: "space-between" },
  macroLabel: { fontSize: 14, fontWeight: "700" },
  macroValue: { fontSize: 13 },
  track: { borderRadius: 99, height: 8, overflow: "hidden" },
  fill: { backgroundColor: brand.lime, height: 8 },
  pips: { flexDirection: "row", justifyContent: "space-between" },
  pipCol: { alignItems: "center", gap: 6 },
  pip: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  pipLabel: { fontSize: 11, fontWeight: "600" },
  row: { paddingVertical: 14 },
  rowLabel: { fontSize: 16, fontWeight: "700" },
});
