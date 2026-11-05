import { Screen } from "@/components/Screen";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { type ProgrammeOption } from "@/lib/plan";
import { theme } from "@/lib/theme";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";

export default function ProgrammesScreen() {
  const { status } = useAuth();
  const router = useRouter();
  const [programmes, setProgrammes] = useState<ProgrammeOption[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "signedIn") return;
    api<ProgrammeOption[]>("/programmes").then(setProgrammes).catch(() => undefined);
  }, [status]);

  if (status === "signedOut") return <Redirect href="/(auth)/login" />;

  async function choose(slug: string) {
    setBusy(slug);
    try {
      await api("/plan", { method: "POST", body: { slug } });
      router.back();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen label="Training" title="Choose a programme" body="Any programme is open to you. This replaces the current week.">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: theme.space.sm, paddingBottom: 32 }}>
        {programmes.map((programme) => (
          <Pressable key={programme.id} disabled={busy !== null} onPress={() => void choose(programme.slug)} style={card}>
            <Text style={title}>{programme.name}</Text>
            <Text style={detail}>{programme.description}</Text>
            <Text style={detail}>{busy === programme.slug ? "Saving" : programme.location}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => router.back()}>
          <Text style={back}>Back</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const card = { backgroundColor: theme.color.surface, borderRadius: 14, gap: 4, padding: theme.space.md };
const title = { color: theme.color.text, fontSize: theme.type.body, fontWeight: "700" as const };
const detail = { color: theme.color.textMuted, fontSize: theme.type.body, lineHeight: 24 };
const back = { color: theme.color.accent, fontSize: theme.type.body, fontWeight: "600" as const, marginTop: theme.space.md };
