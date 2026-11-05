import { Field, PrimaryButton, TextLink } from "@/components/Form";
import { RestTimer } from "@/components/RestTimer";
import { Screen } from "@/components/Screen";
import { api } from "@/lib/api";
import { workoutCompleteHrefWithSummary } from "@/lib/routes";
import {
  completeWorkout,
  currentExerciseIndex,
  fetchWorkout,
  isLocalSessionId,
  patchSet,
  patchSkip,
  recalcSession,
  skipWorkoutExercise,
  syncWorkout,
  updateWorkoutGymMode,
  updateWorkoutSet,
  workoutTarget,
  type WorkoutExercise,
  type WorkoutSession,
} from "@/lib/workout";
import { flushPendingWorkout, loadStoredWorkout, persistWorkout } from "@/lib/workoutStorage";
import { theme } from "@/lib/theme";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

const skipReasons = ["Equipment busy", "Pain or discomfort", "Too tired", "Other"];

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [resting, setResting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    await flushPendingWorkout();
    if (isLocalSessionId(id)) {
      const stored = await loadStoredWorkout();
      if (stored) {
        setSession(stored);
        setExerciseIndex(currentExerciseIndex(stored));
      }
      return;
    }
    try {
      const remote = await fetchWorkout(id);
      setSession(remote);
      setExerciseIndex(currentExerciseIndex(remote));
      if (remote.status === "in_progress") await persistWorkout(remote);
    } catch {
      const stored = await loadStoredWorkout();
      if (stored?.id === id) {
        setSession(stored);
        setExerciseIndex(currentExerciseIndex(stored));
      } else {
        setError("Workout could not be loaded.");
      }
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const exercise = session?.exercises[exerciseIndex];
  const remaining = useMemo(() => {
    if (!session) return 0;
    return session.exercises.filter(
      (item) => !item.skipped && item.sets.some((set) => !set.completed),
    ).length;
  }, [session]);

  const applySession = async (next: WorkoutSession, pendingSync = false) => {
    const saved = await persistWorkout(next, pendingSync);
    setSession(saved);
    setExerciseIndex(currentExerciseIndex(saved));
  };

  const mutate = async (
    localNext: WorkoutSession,
    remote?: () => Promise<WorkoutSession>,
  ) => {
    if (!session) return;
    setBusy(true);
    setError(null);
    const offline = isLocalSessionId(session.id) || session.pendingSync;
    try {
      if (offline || !remote) {
        await applySession(localNext, true);
        return;
      }
      const next = await remote();
      await applySession(next);
    } catch {
      await applySession({ ...localNext, pendingSync: true }, true);
      setError("Saved on this phone. We will sync when you are back online.");
    } finally {
      setBusy(false);
    }
  };

  const onCompleteSet = async (setNumber: number, weightText: string, repsText: string) => {
    if (!session || !exercise) return;
    const weightKg = weightText.trim() === "" ? null : Number(weightText);
    const reps = repsText.trim() === "" ? null : Number(repsText);
    const localNext = patchSet(session, exercise.id, setNumber, {
      weightKg: Number.isFinite(weightKg) ? weightKg : null,
      reps: Number.isFinite(reps) ? reps : null,
      completed: true,
    });
    await mutate(localNext, () =>
      updateWorkoutSet(session.id, exercise.id, setNumber, {
        weightKg: Number.isFinite(weightKg) ? weightKg : null,
        reps: Number.isFinite(reps) ? reps : null,
        completed: true,
      }),
    );
    const moreSets = exercise.sets.some((set) => set.setNumber !== setNumber && !set.completed);
    if (moreSets) setResting(true);
  };

  const onSkip = (reason: string, replacement?: { id: string; name: string }) => {
    if (!session || !exercise) return;
    const localNext = patchSkip(session, exercise.id, reason, replacement);
    mutate(
      localNext,
      replacement
        ? () => skipWorkoutExercise(session.id, exercise.id, reason, replacement.id)
        : () => skipWorkoutExercise(session.id, exercise.id, reason),
    );
  };

  const onFinish = async () => {
    if (!session) return;
    setBusy(true);
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000));
      let next = recalcSession({
        ...session,
        status: "completed",
        completedAt: new Date().toISOString(),
        durationSeconds,
      });
      if (isLocalSessionId(session.id) || session.pendingSync) {
        next = await syncWorkout(next);
      } else {
        next = await completeWorkout(session.id);
      }
      await persistWorkout(next);
      router.replace(
        workoutCompleteHrefWithSummary({
          title: next.title,
          duration: String(next.durationSeconds ?? 0),
          sets: String(next.completedSets),
          volume: String(next.totalVolumeKg),
        }),
      );
    } catch {
      setError("Could not finish the workout yet. Try again when you are online.");
    } finally {
      setBusy(false);
    }
  };

  const toggleGymMode = () => {
    if (!session) return;
    const gymMode = !session.gymMode;
    mutate({ ...session, gymMode }, () => updateWorkoutGymMode(session.id, gymMode));
  };

  if (!id) return <Redirect href="/(tabs)" />;

  return (
    <Screen
      label={session?.gymMode ? "Gym mode" : "Workout"}
      title={exercise?.name ?? session?.title ?? "Training"}
      body={exercise ? workoutTarget(exercise) : undefined}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: theme.space.md, paddingBottom: 40 }}>
        {error ? <Text style={muted}>{error}</Text> : null}
        {session ? (
          <Text style={muted}>
            {remaining === 0
              ? "All exercises logged. Finish when you are ready."
              : `${remaining} exercise${remaining === 1 ? "" : "s"} left`}
          </Text>
        ) : null}

        {exercise ? (
          <>
            <Text style={muted}>{exercise.primaryMuscles.join(" · ")}</Text>
            {exercise.suggestedWeightKg != null ? (
              <Text style={muted}>{`Suggested weight: ${exercise.suggestedWeightKg} kg`}</Text>
            ) : null}

            {resting ? (
              <RestTimer defaultSeconds={exercise.restSeconds} gymMode={session?.gymMode} onDone={() => setResting(false)} />
            ) : (
              <View style={{ gap: theme.space.md }}>
                {exercise.sets.map((set) => (
                  <SetCard
                    key={set.setNumber}
                    exercise={exercise}
                    set={set}
                    gymMode={session?.gymMode}
                    disabled={busy || set.completed}
                    onComplete={(weight, reps) => onCompleteSet(set.setNumber, weight, reps)}
                  />
                ))}
              </View>
            )}

            <View style={{ gap: theme.space.sm }}>
              <Text style={section}>Skip or swap</Text>
              {skipReasons.map((reason) => (
                <Pressable key={reason} onPress={() => onSkip(reason)} style={chip}>
                  <Text style={chipText}>{`Skip · ${reason}`}</Text>
                </Pressable>
              ))}
              <TextLink
                label="Replace with an alternative"
                onPress={() => {
                  api<{ alternatives: { id: string; name: string }[] }>(`/exercises/${exercise.exerciseId}`)
                    .then((detail) => {
                      if (!detail.alternatives.length) {
                        Alert.alert("No alternatives", "We do not have a swap for this exercise yet.");
                        return;
                      }
                      Alert.alert(
                        "Replace exercise",
                        "Pick an alternative",
                        detail.alternatives.map((item) => ({
                          text: item.name,
                          onPress: () => onSkip("Swapped during workout", item),
                        })),
                      );
                    })
                    .catch(() => undefined);
                }}
              />
            </View>
          </>
        ) : null}

        <PrimaryButton label={session?.gymMode ? "Standard mode" : "Gym mode"} onPress={toggleGymMode} />
        {remaining === 0 && session?.status === "in_progress" ? (
          <PrimaryButton label="Finish workout" onPress={onFinish} disabled={busy} />
        ) : null}
        <TextLink label="Back to home" onPress={() => router.replace("/(tabs)")} />
      </ScrollView>
    </Screen>
  );
}

function SetCard({
  exercise,
  set,
  gymMode,
  disabled,
  onComplete,
}: {
  exercise: WorkoutExercise;
  set: WorkoutExercise["sets"][number];
  gymMode?: boolean;
  disabled?: boolean;
  onComplete: (weight: string, reps: string) => void;
}) {
  const [weight, setWeight] = useState(set.weightKg?.toString() ?? exercise.suggestedWeightKg?.toString() ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? String(exercise.repsMax));

  return (
    <View style={card}>
      <Text style={{ color: theme.color.text, fontSize: gymMode ? 24 : theme.type.body, fontWeight: "700" }}>
        {`Set ${set.setNumber}${set.completed ? " · done" : ""}`}
      </Text>
      <Field
        label="Weight (kg)"
        keyboardType="decimal-pad"
        value={weight}
        editable={!set.completed}
        onChangeText={setWeight}
      />
      <Field
        label="Reps"
        keyboardType="number-pad"
        value={reps}
        editable={!set.completed}
        onChangeText={setReps}
      />
      {!set.completed ? (
        <PrimaryButton
          label={gymMode ? "Complete set" : "Complete set"}
          disabled={disabled}
          onPress={() => onComplete(weight, reps)}
        />
      ) : null}
    </View>
  );
}

const muted = { color: theme.color.textMuted, fontSize: theme.type.body, lineHeight: 24 };
const section = { color: theme.color.text, fontSize: theme.type.label, fontWeight: "700" as const };
const card = {
  backgroundColor: theme.color.surface,
  borderRadius: 16,
  gap: theme.space.sm,
  padding: theme.space.md,
};
const chip = {
  backgroundColor: theme.color.surface,
  borderRadius: 12,
  padding: theme.space.md,
};
const chipText = { color: theme.color.text, fontSize: theme.type.body };
