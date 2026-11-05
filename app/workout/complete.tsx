import { PrimaryButton } from "@/components/Form";
import { Screen } from "@/components/Screen";
import { workoutHistoryHref } from "@/lib/routes";
import { formatDuration, formatVolume } from "@/lib/workout";
import { theme } from "@/lib/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function WorkoutCompleteScreen() {
  const router = useRouter();
  const { title, duration, sets, volume } = useLocalSearchParams<{
    title?: string;
    duration?: string;
    sets?: string;
    volume?: string;
  }>();

  const durationSeconds = Number(duration ?? 0);
  const completedSets = Number(sets ?? 0);
  const totalVolumeKg = Number(volume ?? 0);

  return (
    <Screen label="Done" title="Workout complete" body={title ?? "Great session"}>
      <View style={{ gap: theme.space.lg, flex: 1 }}>
        <Stat label="Time" value={formatDuration(durationSeconds)} />
        <Stat label="Sets logged" value={String(completedSets)} />
        <Stat label="Volume" value={formatVolume(totalVolumeKg)} />
        <PrimaryButton label="Back to home" onPress={() => router.replace("/(tabs)")} />
        <PrimaryButton label="View history" onPress={() => router.replace(workoutHistoryHref)} />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: theme.color.surface, borderRadius: 16, padding: theme.space.lg, gap: 4 }}>
      <Text style={{ color: theme.color.textMuted, fontSize: theme.type.label }}>{label}</Text>
      <Text style={{ color: theme.color.text, fontSize: 28, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}
