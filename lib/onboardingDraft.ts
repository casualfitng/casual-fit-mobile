import type { ActivityLevel, Gender } from "@/lib/targets";

export type OnboardingDraft = {
  name: string;
  age: string;
  gender: string | null;
  heightCm: string;
  weightKg: string;
  goalWeightKg: string;
  goals: string[];
  experience: string | null;
  location: string | null;
  equipment: string[];
  trainingDays: string[];
  activityLevel: string | null;
  cuisines: string[];
  restrictions: string[];
};

export const defaultTrainingDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const fullSteps = [
  "about",
  "body",
  "goals",
  "experience",
  "place",
  "equipment",
  "days",
  "activity",
  "food",
  "review",
] as const;

export type FullStep = (typeof fullSteps)[number];

export function emptyDraft(): OnboardingDraft {
  return {
    name: "",
    age: "",
    gender: null,
    heightCm: "",
    weightKg: "",
    goalWeightKg: "",
    goals: [],
    experience: null,
    location: null,
    equipment: [],
    trainingDays: defaultTrainingDays,
    activityLevel: null,
    cuisines: [],
    restrictions: [],
  };
}

/** Placeholder body stats — user can fix in Profile. */
export const placeholderBody = {
  age: 30,
  heightCm: 170,
  weightKg: 70,
  goalWeightKg: 70,
  gender: "prefer_not_to_say" as Gender,
  activityLevel: "moderate" as ActivityLevel,
};

export function draftToSaveBody(draft: OnboardingDraft) {
  return {
    name: draft.name.trim(),
    age: Number(draft.age),
    gender: draft.gender,
    heightCm: Number(draft.heightCm),
    weightKg: Number(draft.weightKg),
    goalWeightKg: Number(draft.goalWeightKg),
    goals: draft.goals,
    experience: draft.experience,
    location: draft.location,
    equipment: draft.location === "gym" ? [] : draft.equipment,
    trainingDays: draft.trainingDays,
    activityLevel: draft.activityLevel,
    cuisines: draft.cuisines,
    restrictions: draft.restrictions,
  };
}

export function skipDefaults(name: string) {
  const trimmed = name.trim() || "Member";
  return {
    name: trimmed,
    age: placeholderBody.age,
    gender: placeholderBody.gender,
    heightCm: placeholderBody.heightCm,
    weightKg: placeholderBody.weightKg,
    goalWeightKg: placeholderBody.goalWeightKg,
    goals: ["improve_fitness"],
    experience: "beginner",
    location: "gym",
    equipment: [] as string[],
    trainingDays: defaultTrainingDays,
    activityLevel: placeholderBody.activityLevel,
    cuisines: ["international"],
    restrictions: [] as string[],
  };
}

export function quickDefaultsFromDraft(draft: OnboardingDraft) {
  return {
    ...draftToSaveBody({
      ...draft,
      age: String(placeholderBody.age),
      gender: draft.gender ?? placeholderBody.gender,
      heightCm: String(placeholderBody.heightCm),
      weightKg: String(placeholderBody.weightKg),
      goalWeightKg: String(placeholderBody.goalWeightKg),
      activityLevel: placeholderBody.activityLevel,
      cuisines: ["international"],
      restrictions: draft.restrictions,
      trainingDays:
        draft.trainingDays.length > 0 ? draft.trainingDays : defaultTrainingDays,
      equipment: draft.location === "gym" ? [] : draft.equipment,
    }),
  };
}

export function titleForStep(step: FullStep) {
  switch (step) {
    case "about":
      return "About you";
    case "body":
      return "Your body";
    case "goals":
      return "Your goals";
    case "experience":
      return "Training experience";
    case "place":
      return "Where you train";
    case "equipment":
      return "Home equipment";
    case "days":
      return "Training days";
    case "activity":
      return "Daily activity";
    case "food":
      return "Food preferences";
    case "review":
      return "Your estimate";
  }
}

export function validateFullStep(step: FullStep, draft: OnboardingDraft) {
  if (step === "about") {
    if (draft.name.trim().length === 0) return "Add your name.";
    const age = Number(draft.age);
    if (!Number.isInteger(age) || age < 16 || age > 100) return "Age needs to be from 16 to 100.";
    if (!draft.gender) return "Choose a gender option.";
  }
  if (step === "body") {
    const height = Number(draft.heightCm);
    const weight = Number(draft.weightKg);
    const goal = Number(draft.goalWeightKg);
    if (height < 120 || height > 230) return "Height needs to be from 120 to 230 cm.";
    if (weight < 30 || weight > 300) return "Weight needs to be from 30 to 300 kg.";
    if (goal < 30 || goal > 300) return "Goal weight needs to be from 30 to 300 kg.";
  }
  if (step === "goals" && draft.goals.length === 0) return "Choose at least one goal.";
  if (step === "experience" && !draft.experience) return "Choose your experience.";
  if (step === "place" && !draft.location) return "Choose where you train.";
  if (step === "equipment" && draft.location !== "gym" && draft.equipment.length === 0) {
    return "Choose the equipment you have, or no equipment.";
  }
  if (step === "days" && draft.trainingDays.length === 0) return "Choose at least one day.";
  if (step === "activity" && !draft.activityLevel) return "Choose how active you are.";
  if (step === "food" && draft.cuisines.length === 0) return "Choose at least one cuisine.";
  return null;
}

export function validateQuickStep(step: number, draft: OnboardingDraft) {
  if (step === 0) {
    if (draft.name.trim().length === 0) return "Add your name.";
    if (draft.goals.length === 0) return "Pick at least one goal.";
  }
  if (step === 1) {
    if (!draft.experience) return "Choose your experience.";
    if (!draft.location) return "Choose where you train.";
    if (draft.location !== "gym" && draft.equipment.length === 0) {
      return "Choose home equipment, or no equipment.";
    }
  }
  return null;
}
