import { Screen } from "@/components/Screen";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { theme } from "@/lib/theme";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";

type LibraryExercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  difficulty: string;
};

export default function LibraryScreen() {
  const { status } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<LibraryExercise[]>([]);

  useEffect(() => {
    if (status !== "signedIn") return;
    api<LibraryExercise[]>("/exercises").then(setItems).catch(() => undefined);
  }, [status]);

  if (status === "signedOut") return <Redirect href="/(auth)/login" />;

  return (
    <Screen label="Library" title="Exercises">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: theme.space.sm, paddingBottom: 32 }}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => router.push(`/exercise/${item.id}`)} style={row}>
            <Text style={name}>{item.name}</Text>
            <Text style={meta}>{`${item.primaryMuscles.join(", ")} · ${item.difficulty}`}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => router.back()}>
          <Text style={back}>Back</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const row = { gap: 2, paddingVertical: 8 };
const name = { color: theme.color.text, fontSize: theme.type.body, fontWeight: "700" as const };
const meta = { color: theme.color.textMuted, fontSize: theme.type.body };
const back = { color: theme.color.accent, fontSize: theme.type.body, fontWeight: "600" as const, marginTop: theme.space.md };
