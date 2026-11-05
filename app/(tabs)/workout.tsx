import { TextLink } from "@/components/Form";
import { GlassCard } from "@/components/GlassCard";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/lib/appTheme";
import { api } from "@/lib/api";
import { workoutHistoryHref } from "@/lib/routes";
import { prescription, weekdayLabel, type Plan } from "@/lib/plan";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, Text } from "react-native";

export default function WorkoutScreen() {
  const router = useRouter();
  const t = useAppTheme();
  const [plan, setPlan] = useState<Plan | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      api<Plan>("/plan")
        .then((next) => {
          if (active) setPlan(next);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen scroll label="Training" title="This week" body={plan?.name}>
      {plan?.days.map((day) => (
        <GlassCard key={day.id}>
          <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: "700" }}>
            {`${weekdayLabel(day.weekday)} · ${day.isRest ? "Rest" : day.title}`}
          </Text>
          {day.exercises.map((exercise) => (
            <Pressable key={`${day.id}-${exercise.id}`} onPress={() => router.push(`/exercise/${exercise.id}`)}>
              <Text style={{ color: t.colors.textMuted, fontSize: 16, lineHeight: 24 }}>
                {`${exercise.name} · ${prescription(exercise)}`}
              </Text>
            </Pressable>
          ))}
        </GlassCard>
      ))}
      <TextLink label="Workout history" onPress={() => router.push(workoutHistoryHref)} />
      <TextLink label="Change programme" onPress={() => router.push("/programmes")} />
      <TextLink label="Exercise library" onPress={() => router.push("/library")} />
    </Screen>
  );
}
