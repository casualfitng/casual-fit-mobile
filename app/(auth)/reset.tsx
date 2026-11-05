import { AuthScreen } from "@/components/auth/AuthScreen";
import {
  AuthBody,
  AuthField,
  AuthFormError,
  AuthPasswordField,
  AuthPrimaryButton,
  AuthTextLink,
} from "@/components/auth/AuthForm";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";

export default function ResetScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState(params.token ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not reset the password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen kicker="Account" title="Choose a new password">
      <AuthFormError message={error} />
      {done ? (
        <AuthBody>Password saved. Sign in with the new one.</AuthBody>
      ) : null}
      {done ? (
        <AuthPrimaryButton label="Sign in" onPress={() => router.replace("/(auth)/login")} />
      ) : (
        <>
          <AuthField label="Reset token" value={token} onChangeText={setToken} autoCapitalize="none" />
          <AuthPasswordField
            label="New password"
            value={password}
            onChangeText={setPassword}
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <AuthPrimaryButton
            label={busy ? "Saving…" : "Save password"}
            onPress={() => void submit()}
            disabled={busy}
          />
        </>
      )}
      <AuthTextLink label="Back to sign in" onPress={() => router.replace("/(auth)/login")} />
    </AuthScreen>
  );
}
