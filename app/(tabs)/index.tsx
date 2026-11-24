import { MacroBar, StatTile, WeekPips } from "@/components/fitness/Bits";
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
import { ActivityIndicator, Pressable, Text, View } from "react-native";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [active, setActive] = useState<WorkoutSession | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const weekday = todayWeekday();

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      api<Plan>("/plan").catch(() => null),
      flushPendingWorkout()
        .then((stored) => fetchActiveWorkout().then((remote) => remote ?? stored))
        .catch(() => loadStoredWorkout()),
      fetchProgressSummary().catch(() => null),
    ]).then(([nextPlan, session, nextProgress]) => {
      if (!alive) return;
      setPlan(nextPlan);
      setActive(session);
      setProgress(nextProgress);
      setError(nextPlan ? null : "The plan could not be loaded.");
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  useFocusEffect(load);

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
    <Screen scroll showLogo label={greeting()} title={weekdayLabel(weekday)} body={plan?.name ?? "Train · Eat · Track · Grow"}>
      {loading ? <ActivityIndicator color={t.colors.accent} /> : null}
      {error ? <Text style={{ color: t.colors.error, lineHeight: 22 }}>{error}</Text> : null}

      {progress?.weekDays?.length ? (
        <GlassCard>
          <Text style={{ color: t.colors.text, fontSize: 15, fontWeight: "700" }}>This week</Text>
          <WeekPips days={progress.weekDays} />
          <Text style={{ color: t.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
            Filled days are finished sessions. A dot is a planned rest day.
          </Text>
        </GlassCard>
      ) : null}

      {progress ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <StatTile label="Streak" value={`${progress.streakDays}`} hint="days" />
          <StatTile label="Weight" value={formatWeight(progress.latestWeightKg)} />
          <StatTile
            label="Sessions"
            value={`${progress.week.workoutsCompleted}/${progress.week.trainingDaysPlanned}`}
            hint="this week"
          />
        </View>
      ) : null}

      <GlassCard>
        <Text style={{ color: t.colors.text, fontSize: 22, fontWeight: "700", letterSpacing: -0.3 }}>
          {today?.isRest ? "Rest day" : (today?.title ?? "Today")}
        </Text>
        {today && !today.isRest ? (
          <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>
            {`${today.minutes} min · ${today.exercises.length} exercises`}
          </Text>
        ) : null}
        {today?.isRest ? (
          <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>
            Recovery is part of the plan. The next training day is on Workout.
          </Text>
        ) : null}
        {active?.status === "in_progress" ? (
          <PrimaryButton label="Resume workout" onPress={() => router.push(workoutSessionHref(active.id))} />
        ) : null}
        {today && !today.isRest && active?.status !== "in_progress" ? (
          <PrimaryButton label={starting ? "Starting…" : "Start workout"} onPress={start} disabled={starting} />
        ) : null}
        {!plan && !loading ? (
          <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>No programme yet. Open Workout to pick one.</Text>
        ) : null}
      </GlassCard>

      {today && !today.isRest
        ? today.exercises.map((exercise, index) => (
            <Pressable key={`${exercise.id}-${exercise.name}`} onPress={() => router.push(`/exercise/${exercise.id}`)}>
              <GlassCard style={{ paddingVertical: 14 }}>
                <Text style={{ color: t.colors.textMuted, fontSize: 12, fontWeight: "700" }}>{`0${index + 1}`}</Text>
                <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>{exercise.name}</Text>
                <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>{prescription(exercise)}</Text>
              </GlassCard>
            </Pressable>
          ))
        : null}

      {progress ? (
        <GlassCard>
          <MacroBar
            label="Training minutes"
            current={progress.week.minutesTrained}
            target={today && !today.isRest ? today.minutes * Math.max(progress.week.trainingDaysPlanned, 1) : null}
            unit=" min"
          />
        </GlassCard>
      ) : null}
    </Screen>
  );
}
