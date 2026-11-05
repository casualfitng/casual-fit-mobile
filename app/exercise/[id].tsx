import { Screen } from "@/components/Screen";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { theme } from "@/lib/theme";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type ExerciseDetail = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  difficulty: string;
  instructions: string[];
  mistakes: string[];
  demoUrl: string | null;
  alternatives: { id: string; name: string }[];
};

export default function ExerciseScreen() {
  const { status } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);

  useEffect(() => {
    if (!id || status !== "signedIn") return;
    api<ExerciseDetail>(`/exercises/${id}`)
      .then(setExercise)
      .catch(() => undefined);
  }, [id, status]);

  if (status === "signedOut") return <Redirect href="/(auth)/login" />;

  return (
    <Screen label={exercise?.difficulty ?? "Exercise"} title={exercise?.name ?? "Exercise"} body={exercise?.primaryMuscles.join(", ")}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: theme.space.md, paddingBottom: 32 }}>
        <View style={demo}>
          <Text style={demoText}>{exercise?.demoUrl ? "Demonstration" : "Demonstration slot"}</Text>
        </View>
        <Text style={heading}>How to perform</Text>
        {exercise?.instructions.map((step, index) => (
          <Text key={step} style={body}>{`${index + 1}. ${step}`}</Text>
        ))}
        <Text style={heading}>Common mistakes</Text>
        {exercise?.mistakes.map((mistake) => (
          <Text key={mistake} style={body}>{mistake}</Text>
        ))}
        {exercise && exercise.alternatives.length > 0 ? <Text style={heading}>Alternatives</Text> : null}
        {exercise?.alternatives.map((alternative) => (
          <Pressable key={alternative.id} onPress={() => router.push(`/exercise/${alternative.id}`)}>
            <Text style={link}>{alternative.name}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => router.back()}>
          <Text style={link}>Back</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const demo = {
  alignItems: "center" as const,
  backgroundColor: theme.color.surface,
  borderRadius: 14,
  justifyContent: "center" as const,
  minHeight: 160,
};
const demoText = { color: theme.color.textMuted, fontSize: theme.type.body };
const heading = { color: theme.color.text, fontSize: theme.type.body, fontWeight: "700" as const, marginTop: theme.space.sm };
const body = { color: theme.color.textMuted, fontSize: theme.type.body, lineHeight: 24 };
const link = { color: theme.color.accent, fontSize: theme.type.body, fontWeight: "600" as const };
