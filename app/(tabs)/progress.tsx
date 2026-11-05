import { Field, FormError, PrimaryButton, TextLink } from "@/components/Form";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { WeightChart } from "@/components/WeightChart";
import { useAppTheme } from "@/lib/appTheme";
import { fetchProgressSummary, formatWeight, logBodyWeight, type ProgressSummary } from "@/lib/progress";
import { workoutHistoryHref } from "@/lib/routes";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

export default function ProgressScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProgressSummary()
        .then((next) => {
          setSummary(next);
          setWeightInput((current) =>
            current || (next.latestWeightKg != null ? String(next.latestWeightKg) : ""),
          );
        })
        .catch(() => setError("Progress could not be loaded."));
    }, []),
  );

  const saveWeight = async () => {
    const weightKg = Number(weightInput);
    if (!Number.isFinite(weightKg)) {
      setError("Enter a weight in kilograms.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await logBodyWeight(weightKg);
      const next = await fetchProgressSummary();
      setSummary(next);
    } catch {
      setError("Weight could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll label="Tracking" title="Progress" body="Weight, streak, and weekly training">
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Stat
          label="Streak"
          value={`${summary?.streakDays ?? 0} days`}
          hint="Planned rest days do not break this."
        />
        <Stat
          label="This week"
          value={`${summary?.week.workoutsCompleted ?? 0} / ${summary?.week.trainingDaysPlanned ?? 0}`}
          hint={`${summary?.week.minutesTrained ?? 0} min trained`}
        />
      </View>

      <GlassCard>
        <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>Weight</Text>
        <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>
          {`Latest: ${formatWeight(summary?.latestWeightKg ?? null)} · Goal: ${formatWeight(summary?.goalWeightKg ?? null)}`}
        </Text>
        <WeightChart points={summary?.weights ?? []} goalKg={summary?.goalWeightKg} />
        <Field label="Log today (kg)" keyboardType="decimal-pad" value={weightInput} onChangeText={setWeightInput} />
        <FormError message={error} />
        <PrimaryButton label="Save weight" onPress={saveWeight} disabled={saving} />
      </GlassCard>

      <TextLink label="Workout history" onPress={() => router.push(workoutHistoryHref)} />
    </Screen>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const t = useAppTheme();
  return (
    <GlassCard style={{ flex: 1 }}>
      <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: t.colors.text, fontSize: 20, fontWeight: "700" }}>{value}</Text>
      {hint ? <Text style={{ color: t.colors.textMuted, fontSize: 13, lineHeight: 18 }}>{hint}</Text> : null}
    </GlassCard>
  );
}
