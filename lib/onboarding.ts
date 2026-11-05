export const goalOptions = [
  { value: "lose_fat", label: "Lose fat" },
  { value: "build_muscle", label: "Build muscle" },
  { value: "gain_weight", label: "Gain weight" },
  { value: "build_strength", label: "Build strength" },
  { value: "maintain_weight", label: "Maintain weight" },
  { value: "improve_fitness", label: "Improve fitness" },
  { value: "improve_body_shape", label: "Improve body shape" },
  { value: "improve_endurance", label: "Improve endurance" },
];

export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const experienceOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const locationOptions = [
  { value: "gym", label: "Gym" },
  { value: "home", label: "Home" },
  { value: "both", label: "Both" },
];

export const equipmentChoices = [
  { value: "dumbbells", label: "Dumbbells" },
  { value: "resistance_bands", label: "Resistance bands" },
  { value: "pull_up_bar", label: "Pull-up bar" },
  { value: "bench", label: "Bench" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "no_equipment", label: "No equipment" },
  { value: "other", label: "Other" },
];

export const dayOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export const activityOptions = [
  { value: "desk", label: "Mostly sitting" },
  { value: "light", label: "Light activity" },
  { value: "moderate", label: "Active most days" },
  { value: "hard", label: "Hard training or physical work" },
];

export const cuisineOptions = [
  { value: "nigerian", label: "Nigerian" },
  { value: "british", label: "British" },
  { value: "international", label: "International" },
];

export const restrictionOptions = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "dairy_free", label: "Dairy-free" },
  { value: "gluten_free", label: "Gluten-free" },
  { value: "nut_allergy", label: "Nut allergy" },
  { value: "egg_allergy", label: "Egg allergy" },
  { value: "fish_allergy", label: "Fish allergy" },
  { value: "shellfish_allergy", label: "Shellfish allergy" },
  { value: "other", label: "Other" },
];

export function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}
