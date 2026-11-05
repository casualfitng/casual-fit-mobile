import { api } from "./api";

export type WeightPoint = {
  id: string;
  weightKg: number;
  loggedOn: string;
};

export type ProgressSummary = {
  streakDays: number;
  latestWeightKg: number | null;
  goalWeightKg: number | null;
  weights: WeightPoint[];
  week: {
    workoutsCompleted: number;
    trainingDaysPlanned: number;
    minutesTrained: number;
  };
};

export async function fetchProgressSummary() {
  return api<ProgressSummary>("/progress");
}

export async function logBodyWeight(weightKg: number, loggedOn?: string) {
  return api<WeightPoint>("/progress/weight", {
    method: "POST",
    body: { weightKg, loggedOn },
  });
}

export function formatWeight(kg: number | null) {
  if (kg == null) return "—";
  return `${kg % 1 === 0 ? kg.toFixed(0) : kg.toFixed(1)} kg`;
}
