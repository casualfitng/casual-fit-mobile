import { MacroBar } from "@/components/fitness/Bits";
import { Field, FormError, PrimaryButton, SecondaryButton } from "@/components/Form";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/lib/appTheme";
import {
  fetchNutritionDay,
  logMeal,
  mealOrder,
  removeMeal,
  searchFoods,
  type FoodItem,
  type MealSlot,
  type NutritionDay,
} from "@/lib/nutrition";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";

export default function NutritionScreen() {
  const t = useAppTheme();
  const [day, setDay] = useState<NutritionDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealSlot | null>(null);

  const load = useCallback(() => {
    let alive = true;
    setLoading(true);
    fetchNutritionDay()
      .then((next) => {
        if (!alive) return;
        setDay(next);
        setError(null);
      })
      .catch(() => {
        if (alive) setError("Today’s food log could not be loaded.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useFocusEffect(load);

  const targets = day?.targets ?? null;
  const totals = day?.totals;

  return (
    <Screen scroll label="Food" title="Today" body="Log what you ate. Targets come from your profile.">
      {loading && !day ? <ActivityIndicator color={t.colors.accent} /> : null}
      {error ? <Text style={{ color: t.colors.error, lineHeight: 22 }}>{error}</Text> : null}

      <GlassCard>
        {!targets ? (
          <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>
            Finish your profile so calorie and protein targets can sit behind these bars.
          </Text>
        ) : null}
        <MacroBar label="Calories" current={totals?.kcal ?? 0} target={targets?.kcal ?? null} unit=" kcal" />
        <MacroBar label="Protein" current={totals?.proteinG ?? 0} target={targets?.proteinG ?? null} unit=" g" />
        <MacroBar label="Carbs" current={totals?.carbsG ?? 0} target={targets?.carbsG ?? null} unit=" g" />
        <MacroBar label="Fat" current={totals?.fatG ?? 0} target={targets?.fatG ?? null} unit=" g" />
        <Text style={{ color: t.colors.textMuted, fontSize: 12, lineHeight: 18 }}>
          Carbs and fat targets are a 25% fat split of your calorie goal. Protein is the target you already set.
        </Text>
      </GlassCard>

      {mealOrder.map(({ key, label }) => {
        const entries = day?.meals[key] ?? [];
        return (
          <GlassCard key={key}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>{label}</Text>
              <Pressable onPress={() => setMeal(key)}>
                <Text style={{ color: t.colors.accent, fontWeight: "700" }}>Add</Text>
              </Pressable>
            </View>
            {entries.length === 0 ? (
              <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>Nothing logged.</Text>
            ) : (
              entries.map((entry) => (
                <Pressable key={entry.id} onPress={() => void removeMeal(entry.id).then(() => load())}>
                  <Text style={{ color: t.colors.text, fontSize: 16 }}>{entry.name}</Text>
                  <Text style={{ color: t.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                    {`${entry.servings}× · ${entry.kcal} kcal · ${entry.proteinG} g protein · tap to remove`}
                  </Text>
                </Pressable>
              ))
            )}
          </GlassCard>
        );
      })}

      <AddFood
        meal={meal}
        onClose={() => setMeal(null)}
        onSaved={() => {
          setMeal(null);
          load();
        }}
      />
    </Screen>
  );
}

function AddFood({
  meal,
  onClose,
  onSaved,
}: {
  meal: MealSlot | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useAppTheme();
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const runSearch = async (value: string) => {
    setQuery(value);
    setError(null);
    try {
      setFoods(await searchFoods(value));
    } catch {
      setError("Food search failed.");
    }
  };

  const save = async () => {
    if (!meal || !picked) return;
    const amount = Number(servings);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter how many servings.");
      return;
    }
    setBusy(true);
    try {
      await logMeal(picked.id, meal, amount);
      setPicked(null);
      setQuery("");
      setServings("1");
      onSaved();
    } catch {
      setError("That entry could not be saved.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={meal != null} animationType="slide" onShow={() => void runSearch("")} onRequestClose={onClose}>
      <ScrollView
        style={{ flex: 1, backgroundColor: t.colors.background }}
        contentContainerStyle={{ gap: 12, padding: 24, paddingTop: 64 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: t.colors.text, fontSize: 28, fontWeight: "700" }}>Add food</Text>
        <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>
          {meal ? mealOrder.find((item) => item.key === meal)?.label : ""}
        </Text>
        <Field label="Search" value={query} onChangeText={(value) => void runSearch(value)} autoCapitalize="words" />
        <FormError message={error} />
        {foods.map((food) => (
          <Pressable key={food.id} onPress={() => setPicked(food)}>
            <GlassCard style={{ paddingVertical: 12, borderWidth: picked?.id === food.id ? 1 : 0, borderColor: t.colors.accent }}>
              <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "700" }}>{food.name}</Text>
              <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
                {`${food.servingLabel} · ${food.kcal} kcal · ${food.proteinG} g protein`}
              </Text>
            </GlassCard>
          </Pressable>
        ))}
        {picked ? (
          <>
            <Field label="Servings" keyboardType="decimal-pad" value={servings} onChangeText={setServings} />
            <PrimaryButton label={busy ? "Saving…" : "Log this"} onPress={() => void save()} disabled={busy} />
          </>
        ) : null}
        <SecondaryButton label="Close" onPress={onClose} />
      </ScrollView>
    </Modal>
  );
}
