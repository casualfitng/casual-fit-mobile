import { StyleSheet, useColorScheme, Image, type ImageStyle, type StyleProp } from "react-native";

const logoDark = require("../assets/images/logo-mark.png");
const logoLight = require("../assets/images/logo-mark-light.png");

type BrandLogoProps = {
  style?: StyleProp<ImageStyle>;
};

/** Transparent mark from site assets; light mode uses gray C from app icon. */
export function BrandLogo({ style }: BrandLogoProps) {
  const isDark = (useColorScheme() ?? "dark") === "dark";
  return (
    <Image
      source={isDark ? logoDark : logoLight}
      style={[styles.logo, style]}
      accessibilityLabel="Casual Fit"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 104,
    resizeMode: "contain",
    width: 168,
  },
});
