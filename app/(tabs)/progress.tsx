import { StatTile, WeekPips } from "@/components/fitness/Bits";
import { Field, FormError, PrimaryButton, TextLink } from "@/components/Form";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { WeightChart } from "@/components/WeightChart";
import { useAppTheme } from "@/lib/appTheme";
import { fetchProgressSummary, formatWeight, logBodyWeight, type ProgressSummary } from "@/lib/progress";
import { workoutHistoryHref } from "@/lib/routes";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function ProgressScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    fetchProgressSummary()
      .then((next) => {
        if (!alive) return;
        setSummary(next);
        setWeightInput((current) => current || (next.latestWeightKg != null ? String(next.latestWeightKg) : ""));
        setError(null);
      })
      .catch(() => {
        if (alive) setError("Progress could not be loaded.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useFocusEffect(load);

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

  const latest = summary?.latestWeightKg ?? null;
  const goal = summary?.goalWeightKg ?? null;
  const delta = latest != null && goal != null ? Math.round((latest - goal) * 10) / 10 : null;

  return (
    <Screen scroll label="Tracking" title="Progress" body="Weight, streak, and the week you actually trained.">
      {loading && !summary ? <ActivityIndicator color={t.colors.accent} /> : null}

      <View style={{ flexDirection: "row", gap: 8 }}>
        <StatTile label="Streak" value={`${summary?.streakDays ?? 0}`} hint="days in a row" />
        <StatTile
          label="This week"
          value={`${summary?.week.workoutsCompleted ?? 0}/${summary?.week.trainingDaysPlanned ?? 0}`}
          hint={`${summary?.week.minutesTrained ?? 0} min`}
        />
      </View>

      {summary?.weekDays?.length ? (
        <GlassCard>
          <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>Week</Text>
          <WeekPips days={summary.weekDays} />
        </GlassCard>
      ) : null}

      <GlassCard>
        <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>Body weight</Text>
        <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>
          {`Latest ${formatWeight(latest)} · Goal ${formatWeight(goal)}`}
          {delta == null ? "" : ` · ${delta > 0 ? `${delta} kg above goal` : delta < 0 ? `${Math.abs(delta)} kg under goal` : "on goal"}`}
        </Text>
        <WeightChart points={summary?.weights ?? []} goalKg={goal} />
        {!summary?.weights.length && !loading ? (
          <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>No weigh-ins yet. Log the first one below.</Text>
        ) : null}
        <Field label="Today (kg)" keyboardType="decimal-pad" value={weightInput} onChangeText={setWeightInput} />
        <FormError message={error} />
        <PrimaryButton label={saving ? "Saving…" : "Save weight"} onPress={saveWeight} disabled={saving} />
      </GlassCard>

      <TextLink label="Workout history" onPress={() => router.push(workoutHistoryHref)} />
    </Screen>
  );
}
