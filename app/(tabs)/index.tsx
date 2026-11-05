import { PrimaryButton } from "@/components/Form";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/lib/appTheme";
import { api } from "@/lib/api";
import { prescription, todayWeekday, weekdayLabel, type Plan } from "@/lib/plan";
import { fetchProgressSummary, formatWeight, type ProgressSummary } from "@/lib/progress";
import { workoutSessionHref } from "@/lib/routes";
import { createClientId, fetchActiveWorkout, startWorkout, type WorkoutSession } from "@/lib/workout";
import { buildLocalWorkout, flushPendingWorkout, loadStoredWorkout, persistWorkout } from "@/lib/workoutStorage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [active, setActive] = useState<WorkoutSession | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const weekday = todayWeekday();

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      api<Plan>("/plan")
        .then((next) => {
          if (alive) setPlan(next);
        })
        .catch(() => {
          if (alive) setError("The plan could not be loaded.");
        });
      flushPendingWorkout()
        .then((stored) => fetchActiveWorkout().then((remote) => remote ?? stored))
        .then((session) => {
          if (alive) setActive(session);
        })
        .catch(() => loadStoredWorkout().then((stored) => alive && setActive(stored)));
      fetchProgressSummary()
        .then((next) => {
          if (alive) setProgress(next);
        })
        .catch(() => undefined);
      return () => {
        alive = false;
      };
    }, []),
  );

  const today = plan?.days.find((day) => day.weekday === weekday);

  const start = async () => {
    if (!today || today.isRest) return;
    setStarting(true);
    setError(null);
    const clientId = createClientId();
    try {
      const session = await startWorkout(today.id, clientId);
      await persistWorkout(session);
      router.push(workoutSessionHref(session.id));
    } catch {
      const local = buildLocalWorkout(today, clientId);
      await persistWorkout(local, true);
      router.push(workoutSessionHref(local.id));
    } finally {
      setStarting(false);
    }
  };

  return (
    <Screen
      scroll
      showLogo
      label={weekdayLabel(weekday)}
      title={today?.isRest ? "Rest day" : (today?.title ?? "Today's workout")}
      body={plan?.name ?? "Train · Eat · Track · Grow"}
    >
      {error ? <Text style={{ color: t.colors.error, lineHeight: 22 }}>{error}</Text> : null}

      {progress ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Dash label="Streak" value={`${progress.streakDays} days`} />
          <Dash label="Weight" value={formatWeight(progress.latestWeightKg)} />
          <Dash
            label="This week"
            value={`${progress.week.workoutsCompleted}/${progress.week.trainingDaysPlanned}`}
          />
        </View>
      ) : null}

      <GlassCard>
        {today && !today.isRest ? (
          <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>
            {`${today.minutes} min · ${today.exercises.length} exercises`}
          </Text>
        ) : null}
        {active?.status === "in_progress" ? (
          <PrimaryButton
            label="Resume workout"
            onPress={() => router.push(workoutSessionHref(active.id))}
          />
        ) : null}
        {today && !today.isRest ? (
          <PrimaryButton label="Start workout" onPress={start} disabled={starting} />
        ) : null}
        {today?.isRest ? (
          <Text style={{ color: t.colors.textMuted, lineHeight: 24 }}>
            Recovery today. Your next training day is on the Workout tab.
          </Text>
        ) : null}
      </GlassCard>

      {today?.exercises.map((exercise) => (
        <Pressable
          key={`${exercise.id}-${exercise.name}`}
          onPress={() => router.push(`/exercise/${exercise.id}`)}
        >
          <GlassCard style={{ paddingVertical: 14 }}>
            <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>{exercise.name}</Text>
            <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>{prescription(exercise)}</Text>
          </GlassCard>
        </Pressable>
      ))}
    </Screen>
  );
}

function Dash({ label, value }: { label: string; value: string }) {
  const t = useAppTheme();
  return (
    <GlassCard style={{ flex: 1, padding: 12 }}>
      <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: t.colors.text, fontSize: 13, fontWeight: "700" }}>{value}</Text>
    </GlassCard>
  );
}
