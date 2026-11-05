import { brand } from "@/lib/brand";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  type TextInputProps,
} from "react-native";

export function AuthHint({ children }: { children: string }) {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  return (
    <Text style={[styles.hint, { color: isDark ? brand.muted : brand.muted }]}>{children}</Text>
  );
}

export function AuthBody({ children }: { children: string }) {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  return (
    <Text style={[styles.body, { color: isDark ? brand.paper : brand.ink }]}>{children}</Text>
  );
}

export function AuthField({
  label,
  ...props
}: { label: string } & TextInputProps) {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  const labelColor = isDark ? brand.paper : brand.ink;
  const placeholder = brand.muted;
  const borderColor = isDark ? brand.lineDark : brand.lineLight;
  const textColor = isDark ? brand.paper : brand.ink;

  return (
    <>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <TextInput
        placeholderTextColor={placeholder}
        autoCapitalize="none"
        style={[styles.input, { borderColor, color: textColor }]}
        {...props}
      />
    </>
  );
}

export function AuthPasswordField({
  label,
  value,
  onChangeText,
  autoComplete,
  textContentType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
}) {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  const [visible, setVisible] = useState(false);
  const labelColor = isDark ? brand.paper : brand.ink;
  const placeholder = brand.muted;
  const borderColor = isDark ? brand.lineDark : brand.lineLight;
  const textColor = isDark ? brand.paper : brand.ink;
  const iconColor = brand.muted;

  return (
    <>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View style={[styles.passwordRow, { borderColor }]}>
        <TextInput
          placeholderTextColor={placeholder}
          autoCapitalize="none"
          secureTextEntry={!visible}
          value={value}
          onChangeText={onChangeText}
          autoComplete={autoComplete}
          textContentType={textContentType}
          style={[styles.passwordInput, { color: textColor }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          style={styles.eyeButton}
        >
          <SymbolView
            name={visible ? "eye.slash" : "eye"}
            size={20}
            tintColor={iconColor}
            type="monochrome"
            weight="medium"
          />
        </Pressable>
      </View>
    </>
  );
}

export function AuthPrimaryButton({
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

export function AuthTextLink({ label, onPress }: { label: string; onPress: () => void }) {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  return (
    <Pressable accessibilityRole="link" onPress={onPress}>
      <Text style={[styles.link, { color: isDark ? brand.lime : brand.limeDeep }]}>{label}</Text>
    </Pressable>
  );
}

export function AuthFormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 17,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  passwordRow: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingLeft: 16,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
    minHeight: 50,
    paddingVertical: 12,
  },
  eyeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  button: {
    alignItems: "center",
    backgroundColor: brand.lime,
    borderRadius: 16,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonLabel: {
    color: brand.onLime,
    fontSize: 17,
    fontWeight: "700",
  },
  link: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 14,
  },
  error: {
    color: brand.error,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  hint: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 8,
  },
});
