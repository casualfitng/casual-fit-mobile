import { RowLink } from "@/components/fitness/Bits";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/lib/appTheme";
import { api } from "@/lib/api";
import { workoutHistoryHref } from "@/lib/routes";
import { prescription, todayWeekday, weekdayLabel, type Plan } from "@/lib/plan";
import { brand } from "@/lib/brand";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function WorkoutScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const today = todayWeekday();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      api<Plan>("/plan")
        .then((next) => {
          if (!active) return;
          setPlan(next);
          setError(null);
        })
        .catch(() => {
          if (active) setError("The week could not be loaded.");
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen scroll label="Training" title="This week" body={plan?.name ?? "Your programme, day by day."}>
      {loading ? <ActivityIndicator color={t.colors.accent} /> : null}
      {error ? <Text style={{ color: t.colors.error, lineHeight: 22 }}>{error}</Text> : null}
      {!loading && !plan && !error ? (
        <GlassCard>
          <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>No programme yet</Text>
          <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>Pick one to fill the week.</Text>
        </GlassCard>
      ) : null}

      {plan?.days.map((day) => {
        const isToday = day.weekday === today;
        return (
          <GlassCard key={day.id} style={{ opacity: day.isRest ? 0.85 : 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>
                {`${weekdayLabel(day.weekday)} · ${day.isRest ? "Rest" : day.title}`}
              </Text>
              {isToday ? (
                <Text style={{ color: brand.onLime, backgroundColor: brand.lime, overflow: "hidden", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: "800" }}>
                  TODAY
                </Text>
              ) : null}
            </View>
            {day.isRest ? (
              <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>Walk, sleep, eat. No session scheduled.</Text>
            ) : (
              <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>{`${day.minutes} min · ${day.exercises.length} moves`}</Text>
            )}
            {day.exercises.map((exercise) => (
              <Pressable key={`${day.id}-${exercise.id}`} onPress={() => router.push(`/exercise/${exercise.id}`)}>
                <Text style={{ color: t.colors.text, fontSize: 16, lineHeight: 24 }}>{exercise.name}</Text>
                <Text style={{ color: t.colors.textMuted, fontSize: 14, lineHeight: 20 }}>{prescription(exercise)}</Text>
              </Pressable>
            ))}
          </GlassCard>
        );
      })}

      <RowLink label="Workout history" detail="Finished sessions" onPress={() => router.push(workoutHistoryHref)} />
      <RowLink label="Change programme" detail={plan?.name} onPress={() => router.push("/programmes")} />
      <RowLink label="Exercise library" detail="Form notes" onPress={() => router.push("/library")} />
    </Screen>
  );
}
