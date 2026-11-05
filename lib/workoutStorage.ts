import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PlanDay } from "./plan";
import {
  createClientId,
  isLocalSessionId,
  syncWorkout,
  type WorkoutSession,
} from "./workout";

const ACTIVE_KEY = "casual_fit_active_workout";

export async function loadStoredWorkout() {
  const raw = await AsyncStorage.getItem(ACTIVE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as WorkoutSession;
}

export async function saveStoredWorkout(session: WorkoutSession | null) {
  if (!session) {
    await AsyncStorage.removeItem(ACTIVE_KEY);
    return;
  }
  await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
}

export function buildLocalWorkout(day: PlanDay, clientId = createClientId()): WorkoutSession {
  const startedAt = new Date().toISOString();
  const exercises = day.exercises.map((exercise, index) => ({
    id: `local-ex-${index}`,
    exerciseId: exercise.id,
    name: exercise.name,
    primaryMuscles: exercise.primaryMuscles,
    demoUrl: exercise.demoUrl,
    position: index,
    targetSets: exercise.sets,
    repsMin: exercise.repsMin,
    repsMax: exercise.repsMax,
    restSeconds: exercise.restSeconds,
    repUnit: exercise.repUnit,
    skipped: false,
    skipReason: null,
    suggestedWeightKg: null,
    sets: Array.from({ length: exercise.sets }, (_, setIndex) => ({
      setNumber: setIndex + 1,
      weightKg: null,
      reps: exercise.repsMax,
      completed: false,
    })),
  }));

  return {
    id: `local:${clientId}`,
    clientId,
    planDayId: day.id,
    weekday: day.weekday,
    title: day.title,
    gymMode: false,
    status: "in_progress",
    startedAt,
    completedAt: null,
    durationSeconds: null,
    totalSets: exercises.reduce((sum, item) => sum + item.sets.length, 0),
    completedSets: 0,
    totalVolumeKg: 0,
    exercises,
    pendingSync: true,
  };
}

export async function flushPendingWorkout() {
  const stored = await loadStoredWorkout();
  if (!stored?.pendingSync) return stored;
  try {
    const synced = await syncWorkout(stored);
    const next = { ...synced, pendingSync: false };
    if (stored.status === "in_progress") {
      await saveStoredWorkout(next);
    } else {
      await saveStoredWorkout(null);
    }
    return next;
  } catch {
    return stored;
  }
}

export async function persistWorkout(session: WorkoutSession, pendingSync = false) {
  const next = { ...session, pendingSync: pendingSync || session.pendingSync || isLocalSessionId(session.id) };
  if (next.status === "completed" && !next.pendingSync) {
    await saveStoredWorkout(null);
    return next;
  }
  await saveStoredWorkout(next);
  return next;
}
