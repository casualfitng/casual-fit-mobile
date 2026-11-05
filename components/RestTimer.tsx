import { PrimaryButton } from "@/components/Form";
import { theme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const presets = [30, 60, 90, 120, 180];

type Props = {
  defaultSeconds: number;
  gymMode?: boolean;
  onDone: () => void;
};

export function RestTimer({ defaultSeconds, gymMode, onDone }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft <= 0) onDone();
  }, [secondsLeft, onDone]);

  const label = `${Math.max(0, secondsLeft)}s`;

  return (
    <View style={{ gap: theme.space.md, padding: theme.space.md, backgroundColor: theme.color.surface, borderRadius: 16 }}>
      <Text style={{ color: theme.color.text, fontSize: gymMode ? 28 : theme.type.title, fontWeight: "700" }}>
        Rest · {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {presets.map((seconds) => (
          <Pressable
            key={seconds}
            onPress={() => {
              setSecondsLeft(seconds);
              setRunning(true);
            }}
            style={chip}
          >
            <Text style={chipLabel}>{seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}</Text>
          </Pressable>
        ))}
      </View>
      <PrimaryButton label={running ? "Pause" : "Resume"} onPress={() => setRunning((value) => !value)} />
      <PrimaryButton label="Skip rest" onPress={onDone} />
    </View>
  );
}

const chip = {
  backgroundColor: theme.color.background,
  borderColor: theme.color.border,
  borderWidth: 1,
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 8,
};

const chipLabel = { color: theme.color.text, fontSize: theme.type.label, fontWeight: "600" as const };
