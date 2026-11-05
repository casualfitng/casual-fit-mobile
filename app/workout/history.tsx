import { TextLink } from "@/components/Form";
import { Screen } from "@/components/Screen";
import { fetchWorkoutHistory, formatDuration, formatVolume, type WorkoutHistoryItem } from "@/lib/workout";
import { theme } from "@/lib/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<WorkoutHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkoutHistory()
      .then(setItems)
      .catch(() => setError("History could not be loaded."));
  }, []);

  return (
    <Screen label="Training" title="Workout history" body="Your finished sessions">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: theme.space.md, paddingBottom: 32 }}>
        {error ? <Text style={muted}>{error}</Text> : null}
        {!items.length && !error ? <Text style={muted}>No workouts logged yet.</Text> : null}
        {items.map((item) => (
          <View key={item.id} style={card}>
            <Text style={title}>{item.title}</Text>
            <Text style={muted}>
              {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "—"} ·{" "}
              {formatDuration(item.durationSeconds)} · {item.totalSets} sets · {formatVolume(item.totalVolumeKg)}
            </Text>
          </View>
        ))}
        <TextLink label="Back" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

const muted = { color: theme.color.textMuted, fontSize: theme.type.body, lineHeight: 24 };
const title = { color: theme.color.text, fontSize: theme.type.body, fontWeight: "700" as const };
const card = {
  backgroundColor: theme.color.surface,
  borderRadius: 14,
  gap: 4,
  padding: theme.space.md,
};
