import { useAppTheme } from "@/lib/appTheme";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function Choices({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const t = useAppTheme();
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? t.colors.accent : t.colors.surface,
                borderColor: selected ? t.colors.accent : t.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: selected ? t.colors.onAccent : t.colors.text },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MultiChoices({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const t = useAppTheme();
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() =>
              onChange(
                selected
                  ? value.filter((item) => item !== option.value)
                  : [...value, option.value],
              )
            }
            style={[
              styles.chip,
              {
                backgroundColor: selected ? t.colors.accent : t.colors.surface,
                borderColor: selected ? t.colors.accent : t.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: selected ? t.colors.onAccent : t.colors.text },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 14,
  },
  chipLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
});
