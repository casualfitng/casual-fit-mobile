import { api } from "./api";

export type WorkoutSet = {
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  primaryMuscles: string[];
  demoUrl: string | null;
  position: number;
  targetSets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  repUnit: string;
  skipped: boolean;
  skipReason: string | null;
  suggestedWeightKg: number | null;
  sets: WorkoutSet[];
};

export type WorkoutSession = {
  id: string;
  clientId: string | null;
  planDayId: string | null;
  weekday: string;
  title: string;
  gymMode: boolean;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  totalSets: number;
  completedSets: number;
  totalVolumeKg: number;
  exercises: WorkoutExercise[];
  pendingSync?: boolean;
};

export type WorkoutHistoryItem = {
  id: string;
  title: string;
  weekday: string;
  completedAt: string | null;
  durationSeconds: number | null;
  totalSets: number;
  totalVolumeKg: number;
};

export function workoutTarget(exercise: WorkoutExercise) {
  const amount =
    exercise.repsMin === exercise.repsMax
      ? `${exercise.repsMin}`
      : `${exercise.repsMin}–${exercise.repsMax}`;
  const unit = exercise.repUnit === "reps" ? "reps" : exercise.repUnit;
  return `${exercise.targetSets} sets × ${amount} ${unit}`;
}

export function formatDuration(seconds: number | null) {
  if (!seconds) return "0 min";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

export function formatVolume(kg: number) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg} kg`;
}

export function currentExerciseIndex(session: WorkoutSession) {
  const index = session.exercises.findIndex(
    (exercise) => !exercise.skipped && exercise.sets.some((set) => !set.completed),
  );
  return index === -1 ? Math.max(0, session.exercises.length - 1) : index;
}

export function recalcSession(session: WorkoutSession): WorkoutSession {
  let totalSets = 0;
  let completedSets = 0;
  let totalVolumeKg = 0;
  for (const exercise of session.exercises) {
    if (exercise.skipped) continue;
    for (const set of exercise.sets) {
      totalSets += 1;
      if (set.completed) {
        completedSets += 1;
        if (set.weightKg != null && set.reps != null) {
          totalVolumeKg += set.weightKg * set.reps;
        }
      }
    }
  }
  return {
    ...session,
    totalSets,
    completedSets,
    totalVolumeKg: Math.round(totalVolumeKg),
  };
}

export function patchSet(
  session: WorkoutSession,
  sessionExerciseId: string,
  setNumber: number,
  patch: Partial<WorkoutSet>,
) {
  const exercises = session.exercises.map((exercise) => {
    if (exercise.id !== sessionExerciseId) return exercise;
    return {
      ...exercise,
      sets: exercise.sets.map((set) => (set.setNumber === setNumber ? { ...set, ...patch } : set)),
    };
  });
  return recalcSession({ ...session, exercises });
}

export function patchSkip(
  session: WorkoutSession,
  sessionExerciseId: string,
  reason: string,
  replacement?: { id: string; name: string },
) {
  const exercises = session.exercises.map((exercise) => {
    if (exercise.id !== sessionExerciseId) return exercise;
    if (replacement) {
      return {
        ...exercise,
        exerciseId: replacement.id,
        name: replacement.name,
        skipped: false,
        skipReason: reason,
        sets: exercise.sets.map((set) => ({ ...set, completed: false })),
      };
    }
    return { ...exercise, skipped: true, skipReason: reason };
  });
  return recalcSession({ ...session, exercises });
}

export function createClientId() {
  return `cf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isLocalSessionId(id: string) {
  return id.startsWith("local:");
}

export async function fetchActiveWorkout() {
  return api<WorkoutSession | null>("/workouts/active");
}

export async function fetchWorkout(id: string) {
  return api<WorkoutSession>(`/workouts/${id}`);
}

export async function startWorkout(planDayId: string, clientId: string) {
  return api<WorkoutSession>("/workouts/start", {
    method: "POST",
    body: { planDayId, clientId },
  });
}

export async function updateWorkoutGymMode(id: string, gymMode: boolean) {
  return api<WorkoutSession>(`/workouts/${id}`, { method: "PATCH", body: { gymMode } });
}

export async function updateWorkoutSet(
  sessionId: string,
  sessionExerciseId: string,
  setNumber: number,
  body: { weightKg?: number | null; reps?: number | null; completed?: boolean },
) {
  return api<WorkoutSession>(`/workouts/${sessionId}/exercises/${sessionExerciseId}/sets/${setNumber}`, {
    method: "PATCH",
    body,
  });
}

export async function skipWorkoutExercise(
  sessionId: string,
  sessionExerciseId: string,
  reason: string,
  replaceExerciseId?: string,
) {
  return api<WorkoutSession>(`/workouts/${sessionId}/exercises/${sessionExerciseId}/skip`, {
    method: "POST",
    body: { reason, replaceExerciseId },
  });
}

export async function completeWorkout(sessionId: string) {
  return api<WorkoutSession>(`/workouts/${sessionId}/complete`, { method: "POST" });
}

export async function syncWorkout(session: WorkoutSession) {
  if (!session.clientId || !session.planDayId) {
    throw new Error("Workout is missing sync metadata.");
  }
  return api<WorkoutSession>("/workouts/sync", {
    method: "POST",
    body: {
      clientId: session.clientId,
      planDayId: session.planDayId,
      weekday: session.weekday,
      title: session.title,
      gymMode: session.gymMode,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      durationSeconds: session.durationSeconds,
      exercises: session.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        position: exercise.position,
        targetSets: exercise.targetSets,
        repsMin: exercise.repsMin,
        repsMax: exercise.repsMax,
        restSeconds: exercise.restSeconds,
        repUnit: exercise.repUnit,
        skipped: exercise.skipped,
        skipReason: exercise.skipReason,
        sets: exercise.sets.map((set) => ({
          setNumber: set.setNumber,
          weightKg: set.weightKg,
          reps: set.reps,
          completed: set.completed,
        })),
      })),
    },
  });
}

export async function fetchWorkoutHistory() {
  return api<WorkoutHistoryItem[]>("/workouts");
}
