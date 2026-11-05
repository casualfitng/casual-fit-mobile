import { useAppTheme } from "@/lib/appTheme";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
} from "react-native";

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  const t = useAppTheme();
  return (
    <>
      <Text style={[styles.label, { color: t.colors.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={t.colors.textMuted}
        autoCapitalize="none"
        style={[
          styles.input,
          {
            backgroundColor: t.colors.surface,
            borderColor: t.colors.border,
            color: t.colors.text,
          },
        ]}
        {...props}
      />
    </>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled ? styles.buttonDisabled : null]}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.secondary,
        { borderColor: t.colors.accent },
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      <Text style={[styles.secondaryLabel, { color: t.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useAppTheme();
  return (
    <Pressable accessibilityRole="link" onPress={onPress}>
      <Text style={[styles.link, { color: t.isDark ? t.colors.accent : t.colors.accentDeep }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FormError({ message }: { message: string | null }) {
  const t = useAppTheme();
  if (!message) return null;
  return <Text style={[styles.error, { color: t.colors.error }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 17,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#7BE13B",
    borderRadius: 16,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 56,
  },
  buttonDisabled: { opacity: 0.55 },
  buttonLabel: {
    color: "#071207",
    fontSize: 17,
    fontWeight: "700",
  },
  secondary: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 52,
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  error: {
    fontSize: 16,
    lineHeight: 22,
  },
});
