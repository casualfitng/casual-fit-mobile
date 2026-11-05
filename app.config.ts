import type { ExpoConfig } from "expo/config";
import { withInfoPlist } from "expo/config-plugins";

const base = require("./app.json").expo as ExpoConfig;

function googleIosUrlScheme(iosClientId: string | undefined) {
  if (!iosClientId) return null;
  const idPart = iosClientId.replace(/\.apps\.googleusercontent\.com$/, "");
  return `com.googleusercontent.apps.${idPart}`;
}

function withGoogleUrlScheme(config: ExpoConfig, scheme: string): ExpoConfig {
  return withInfoPlist(config, (mod) => {
    const urlTypes = [...(mod.modResults.CFBundleURLTypes ?? [])];
    const alreadyRegistered = urlTypes.some((entry) =>
      entry.CFBundleURLSchemes?.includes(scheme),
    );
    if (!alreadyRegistered) {
      urlTypes.push({ CFBundleURLSchemes: [scheme] });
    }
    mod.modResults.CFBundleURLTypes = urlTypes;
    return mod;
  });
}

export default (): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const urlScheme = googleIosUrlScheme(iosClientId);
  const plugins = [...(base.plugins ?? [])].filter(
    (entry) =>
      entry !== "@react-native-google-signin/google-signin" &&
      !(Array.isArray(entry) && entry[0] === "@react-native-google-signin/google-signin"),
  );

  if (urlScheme) {
    plugins.push(["@react-native-google-signin/google-signin", { iosUrlScheme: urlScheme }]);
  }

  if (!plugins.includes("expo-apple-authentication")) {
    plugins.push("expo-apple-authentication");
  }

  let config: ExpoConfig = { ...base, plugins };
  if (urlScheme) {
    config = withGoogleUrlScheme(config, urlScheme);
  }
  return config;
};
