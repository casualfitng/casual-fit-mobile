export type PlanExercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  demoUrl: string | null;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  repUnit: string;
};

export type PlanDay = {
  id: string;
  weekday: string;
  title: string;
  isRest: boolean;
  minutes: number;
  exercises: PlanExercise[];
};

export type Plan = {
  id: string;
  name: string;
  days: PlanDay[];
};

export type ProgrammeOption = {
  id: string;
  slug: string;
  name: string;
  goal: string;
  location: string;
  description: string;
};

const weekdayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function todayWeekday() {
  return weekdayNames[new Date().getDay()];
}

export function weekdayLabel(weekday: string) {
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function prescription(exercise: PlanExercise) {
  const amount = exercise.repsMin === exercise.repsMax ? `${exercise.repsMin}` : `${exercise.repsMin}–${exercise.repsMax}`;
  const unit = exercise.repUnit === "reps" ? "reps" : exercise.repUnit;
  return `${exercise.sets} × ${amount} ${unit}`;
}
