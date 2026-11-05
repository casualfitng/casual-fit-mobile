import { AuthScreen } from "@/components/auth/AuthScreen";
import {
  AuthDivider,
  AuthSocialButtons,
} from "@/components/auth/AuthSocialButtons";
import {
  AuthField,
  AuthFormError,
  AuthPasswordField,
  AuthPrimaryButton,
  AuthTextLink,
} from "@/components/auth/AuthForm";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const { signIn, signInWithApple, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runSocial(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : "Could not sign in.";
      if (message !== "Sign-in was cancelled.") setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen kicker="Welcome back" title="Sign in">
      <AuthFormError message={error} />
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <AuthPasswordField
        label="Password"
        value={password}
        onChangeText={setPassword}
        autoComplete="current-password"
        textContentType="password"
      />
      <AuthPrimaryButton
        label={busy ? "Signing in…" : "Sign in"}
        onPress={() => void submit()}
        disabled={busy}
      />
      <AuthDivider />
      <AuthSocialButtons
        disabled={busy}
        onApple={() => void runSocial(signInWithApple)}
        onGoogle={() => void runSocial(signInWithGoogle)}
      />
      <AuthTextLink label="Forgot password" onPress={() => router.push("/(auth)/forgot")} />
      <AuthTextLink label="Create an account" onPress={() => router.push("/(auth)/signup")} />
    </AuthScreen>
  );
}
