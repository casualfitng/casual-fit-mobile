import { AuthScreen } from "@/components/auth/AuthScreen";
import {
  AuthDivider,
  AuthSocialButtons,
} from "@/components/auth/AuthSocialButtons";
import {
  AuthField,
  AuthFormError,
  AuthHint,
  AuthPasswordField,
  AuthPrimaryButton,
  AuthTextLink,
} from "@/components/auth/AuthForm";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function SignupScreen() {
  const { signUp, signInWithApple, signInWithGoogle } = useAuth();
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
            : "Could not create the account.";
      if (message !== "Sign-in was cancelled.") setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await signUp(email, password);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen kicker="Get started" title="Create account">
      <AuthFormError message={error} />
      <AuthHint>Use at least 8 characters for the password.</AuthHint>
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
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <AuthPrimaryButton
        label={busy ? "Creating account…" : "Create account"}
        onPress={() => void submit()}
        disabled={busy}
      />
      <AuthDivider />
      <AuthSocialButtons
        disabled={busy}
        onApple={() => void runSocial(signInWithApple)}
        onGoogle={() => void runSocial(signInWithGoogle)}
      />
      <AuthTextLink label="Already have an account" onPress={() => router.replace("/(auth)/login")} />
    </AuthScreen>
  );
}
