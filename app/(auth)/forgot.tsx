import { AuthScreen } from "@/components/auth/AuthScreen";
import {
  AuthField,
  AuthFormError,
  AuthHint,
  AuthPrimaryButton,
  AuthTextLink,
} from "@/components/auth/AuthForm";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function ForgotScreen() {
  const { requestReset } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const token = await requestReset(email);
      if (token) {
        router.push({ pathname: "/(auth)/reset", params: { token } });
        return;
      }
      setError("If that email has an account, a reset token is ready.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not start a reset.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen kicker="Account" title="Reset password">
      <AuthHint>
        Enter the email on the account. While we are developing, the app opens the reset form with a
        token.
      </AuthHint>
      <AuthFormError message={error} />
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <AuthPrimaryButton
        label={busy ? "Sending…" : "Continue"}
        onPress={() => void submit()}
        disabled={busy}
      />
      <AuthTextLink label="Back to sign in" onPress={() => router.replace("/(auth)/login")} />
    </AuthScreen>
  );
}
