import { brand } from "@/lib/brand";
import { isAppleSignInAvailable } from "@/lib/socialAuth";
import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

const googleLogo = require("../../assets/images/google-logo.png");

export function AuthDivider({ label = "or continue with" }: { label?: string }) {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  const line = isDark ? brand.lineDark : brand.lineLight;
  const text = brand.muted;

  return (
    <View style={styles.dividerRow}>
      <View style={[styles.dividerLine, { backgroundColor: line }]} />
      <Text style={[styles.dividerLabel, { color: text }]}>{label}</Text>
      <View style={[styles.dividerLine, { backgroundColor: line }]} />
    </View>
  );
}

export function AuthSocialButtons({
  disabled,
  onApple,
  onGoogle,
}: {
  disabled?: boolean;
  onApple: () => void;
  onGoogle: () => void;
}) {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  const [appleReady, setAppleReady] = useState(Platform.OS === "ios");
  const googleReady = Platform.OS !== "web";

  useEffect(() => {
    let active = true;
    void isAppleSignInAvailable().then((value) => {
      if (active) setAppleReady(value);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!appleReady && !googleReady) return null;

  const borderColor = isDark ? brand.lineDark : brand.lineLight;
  const iconColor = isDark ? brand.paper : brand.ink;
  const showBoth = appleReady && googleReady;

  return (
    <View style={[styles.row, showBoth ? null : styles.rowSingle]}>
      {appleReady ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
          disabled={disabled}
          onPress={onApple}
          style={[
            styles.socialButton,
            { borderColor },
            showBoth ? styles.socialHalf : styles.socialSingle,
            disabled ? styles.disabled : null,
          ]}
        >
          <SymbolView
            name="apple.logo"
            size={22}
            tintColor={iconColor}
            type="monochrome"
            weight="medium"
          />
        </Pressable>
      ) : null}
      {googleReady ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          disabled={disabled}
          onPress={onGoogle}
          style={[
            styles.socialButton,
            { borderColor },
            showBoth ? styles.socialHalf : styles.socialSingle,
            disabled ? styles.disabled : null,
          ]}
        >
          <Image source={googleLogo} style={styles.googleLogo} accessibilityIgnoresInvertColors />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginTop: 4,
  },
  rowSingle: {
    justifyContent: "center",
  },
  socialButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
  },
  socialHalf: {
    flex: 1,
  },
  socialSingle: {
    width: 120,
  },
  googleLogo: {
    height: 22,
    width: 22,
  },
  disabled: {
    opacity: 0.55,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
});
