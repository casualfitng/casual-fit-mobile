import { api } from "./api";

export type Macros = {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export type MealEntry = Macros & {
  id: string;
  name: string;
  servings: number;
};

export type FoodItem = Macros & {
  id: string;
  name: string;
  cuisine: string;
  servingLabel: string;
  servingGrams: number;
};

export type NutritionDay = {
  date: string;
  targets: Macros | null;
  totals: Macros;
  meals: Record<MealSlot, MealEntry[]>;
};

export const mealOrder: { key: MealSlot; label: string }[] = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snack", label: "Snacks" },
];

export function fetchNutritionDay() {
  return api<NutritionDay>("/nutrition");
}

export function searchFoods(query: string) {
  const q = encodeURIComponent(query);
  return api<FoodItem[]>(`/nutrition/foods?q=${q}`);
}

export function logMeal(foodId: string, meal: MealSlot, servings: number) {
  return api("/nutrition/logs", { method: "POST", body: { foodId, meal, servings } });
}

export function removeMeal(id: string) {
  return api(`/nutrition/logs/${id}`, { method: "DELETE" });
}
