import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api";
import { saveSession, loadRefreshToken, clearSession } from "./session";
import { signInWithAppleNative, signInWithGoogleNative } from "./socialAuth";

export type Account = {
  id: string;
  email: string;
  role: "user" | "admin";
  onboardingComplete: boolean;
};

type SessionResponse = {
  accessToken: string;
  refreshToken: string;
  user: Account;
};

type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthContextValue = {
  status: AuthStatus;
  user: Account | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  finishOnboarding: () => void;
  requestReset: (email: string) => Promise<string | null>;
  resetPassword: (token: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<Account | null>(null);

  useEffect(() => {
    let active = true;
    async function restore() {
      const refreshToken = await loadRefreshToken();
      if (!refreshToken) {
        if (active) setStatus("signedOut");
        return;
      }
      try {
        const session = await api<SessionResponse>("/auth/refresh", {
          method: "POST",
          auth: false,
          body: { refreshToken },
        });
        await saveSession(session.accessToken, session.refreshToken);
        if (!active) return;
        setUser(session.user);
        setStatus("signedIn");
      } catch {
        await clearSession();
        if (active) setStatus("signedOut");
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      async signUp(email, password) {
        const session = await api<SessionResponse>("/auth/signup", {
          method: "POST",
          auth: false,
          body: { email, password },
        });
        await saveSession(session.accessToken, session.refreshToken);
        setUser(session.user);
        setStatus("signedIn");
      },
      async signIn(email, password) {
        const session = await api<SessionResponse>("/auth/login", {
          method: "POST",
          auth: false,
          body: { email, password },
        });
        await saveSession(session.accessToken, session.refreshToken);
        setUser(session.user);
        setStatus("signedIn");
      },
      async signInWithGoogle() {
        const { idToken, avatarUrl } = await signInWithGoogleNative();
        const session = await api<SessionResponse>("/auth/oauth", {
          method: "POST",
          auth: false,
          body: { provider: "google", idToken, avatarUrl: avatarUrl ?? undefined },
        });
        await saveSession(session.accessToken, session.refreshToken);
        setUser(session.user);
        setStatus("signedIn");
      },
      async signInWithApple() {
        const { idToken } = await signInWithAppleNative();
        const session = await api<SessionResponse>("/auth/oauth", {
          method: "POST",
          auth: false,
          body: { provider: "apple", idToken },
        });
        await saveSession(session.accessToken, session.refreshToken);
        setUser(session.user);
        setStatus("signedIn");
      },
      async signOut() {
        const refreshToken = await loadRefreshToken();
        if (refreshToken) {
          await api("/auth/logout", {
            method: "POST",
            auth: false,
            body: { refreshToken },
          }).catch(() => undefined);
        }
        await clearSession();
        setUser(null);
        setStatus("signedOut");
      },
      async requestReset(email) {
        const result = await api<{ message: string; devResetToken?: string }>(
          "/auth/forgot-password",
          { method: "POST", auth: false, body: { email } },
        );
        return result.devResetToken ?? null;
      },
      async resetPassword(token, password) {
        await api("/auth/reset-password", {
          method: "POST",
          auth: false,
          body: { token, password },
        });
      },
      finishOnboarding() {
        setUser((current) =>
          current ? { ...current, onboardingComplete: true } : current,
        );
      },
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
