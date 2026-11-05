import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";

let googleConfigured = false;

function configureGoogle() {
  if (googleConfigured) return;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!iosClientId && !webClientId) return;
  GoogleSignin.configure({
    iosClientId: iosClientId ?? undefined,
    webClientId: webClientId ?? undefined,
  });
  googleConfigured = true;
}

export function isGoogleSignInConfigured() {
  return Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  );
}

export async function isAppleSignInAvailable() {
  if (Platform.OS !== "ios") return false;
  return AppleAuthentication.isAvailableAsync();
}

export type GoogleSignInResult = {
  idToken: string;
  avatarUrl: string | null;
};

export type AppleSignInResult = {
  idToken: string;
};

export async function signInWithGoogleNative(): Promise<GoogleSignInResult> {
  configureGoogle();
  if (!isGoogleSignInConfigured()) {
    throw new Error("Google sign-in is not configured yet. Add client IDs to apps/mobile/.env.");
  }
  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }
  try {
    const response = await GoogleSignin.signIn();
    const idToken = response.data?.idToken;
    if (!idToken) throw new Error("Google did not return a sign-in token.");
    const photo = response.data?.user?.photo ?? null;
    return { idToken, avatarUrl: photo };
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error("Sign-in was cancelled.");
    }
    if (code === statusCodes.IN_PROGRESS) {
      throw new Error("Google sign-in is already in progress.");
    }
    throw error instanceof Error ? error : new Error("Google sign-in failed.");
  }
}

export async function signInWithAppleNative(): Promise<AppleSignInResult> {
  if (!(await isAppleSignInAvailable())) {
    throw new Error("Sign in with Apple is not available on this device.");
  }
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      throw new Error("Apple did not return a sign-in token.");
    }
    return { idToken: credential.identityToken };
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "ERR_CANCELED") {
      throw new Error("Sign-in was cancelled.");
    }
    throw error instanceof Error ? error : new Error("Apple sign-in failed.");
  }
}

/** @deprecated Use signInWithGoogleNative */
export async function getGoogleIdToken(): Promise<string> {
  const result = await signInWithGoogleNative();
  return result.idToken;
}

/** @deprecated Use signInWithAppleNative */
export async function getAppleIdToken(): Promise<string> {
  const result = await signInWithAppleNative();
  return result.idToken;
}
