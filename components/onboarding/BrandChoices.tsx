import { brand } from "@/lib/brand";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

function useChoiceColors() {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  return {
    border: isDark ? brand.lineDark : brand.lineLight,
    text: isDark ? brand.paper : brand.ink,
    idleBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
  };
}

export function BrandChoices({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const colors = useChoiceColors();
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
                backgroundColor: selected ? brand.lime : colors.idleBg,
                borderColor: selected ? brand.lime : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: selected ? brand.onLime : colors.text },
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

export function BrandMultiChoices({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const colors = useChoiceColors();
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
                backgroundColor: selected ? brand.lime : colors.idleBg,
                borderColor: selected ? brand.lime : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                { color: selected ? brand.onLime : colors.text },
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
