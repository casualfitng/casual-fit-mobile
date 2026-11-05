import { brand } from "@/lib/brand";
import { SecondaryButton, TextLink } from "@/components/Form";
import { GlassCard } from "@/components/GlassCard";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Screen } from "@/components/Screen";
import { useAppTheme } from "@/lib/appTheme";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  activityOptions,
  cuisineOptions,
  dayOptions,
  equipmentChoices,
  experienceOptions,
  genderOptions,
  goalOptions,
  labelFor,
  locationOptions,
  restrictionOptions,
} from "@/lib/onboarding";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type SavedProfile = {
  name: string | null;
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goalWeightKg: number | null;
  goals: string[];
  experience: string | null;
  location: string | null;
  equipment: string[];
  trainingDays: string[];
  activityLevel: string | null;
  cuisines: string[];
  restrictions: string[];
  calorieTarget: number | null;
  proteinTargetG: number | null;
  avatarUrl: string | null;
  avatarImageBase64: string | null;
  avatarMimeType: string | null;
};

function StatPill({ label, value }: { label: string; value: string }) {
  const t = useAppTheme();
  return (
    <View
      style={[
        styles.statPill,
        { borderColor: t.isDark ? "rgba(244, 241, 234, 0.14)" : brand.lineLight },
      ]}
    >
      <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: t.colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ProfileSection({ title, lines }: { title: string; lines: string[] }) {
  const t = useAppTheme();
  if (lines.length === 0) return null;
  return (
    <GlassCard style={styles.sectionCard}>
      <Text style={[styles.sectionTitle, { color: brand.lime }]}>{title}</Text>
      {lines.map((line) => (
        <Text key={`${title}-${line}`} style={[styles.sectionLine, { color: t.colors.text }]}>
          {line}
        </Text>
      ))}
    </GlassCard>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const t = useAppTheme();
  const [profile, setProfile] = useState<SavedProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      api<SavedProfile>("/profile")
        .then((next) => {
          if (active) setProfile(next);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  const displayName = profile?.name?.trim() || "Member";

  const needsProfile =
    profile?.name === "Member" ||
    (profile?.heightCm === 170 && profile?.weightKg === 70 && profile?.age === 30);

  const bodyLines = profile
    ? [
        profile.age ? `${profile.age} years` : null,
        profile.gender ? labelFor(genderOptions, profile.gender) : null,
        profile.heightCm ? `${profile.heightCm} cm tall` : null,
        profile.weightKg
          ? `${profile.weightKg} kg now · goal ${profile.goalWeightKg ?? profile.weightKg} kg`
          : null,
        profile.goals.length > 0
          ? profile.goals.map((goal) => labelFor(goalOptions, goal)).join(" · ")
          : null,
        profile.activityLevel ? labelFor(activityOptions, profile.activityLevel) : null,
      ].filter((line): line is string => Boolean(line))
    : [];

  const trainingLines = profile
    ? [
        profile.experience ? labelFor(experienceOptions, profile.experience) : null,
        profile.location ? labelFor(locationOptions, profile.location) : null,
        profile.equipment.length > 0
          ? profile.equipment.map((item) => labelFor(equipmentChoices, item)).join(" · ")
          : profile.location === "gym"
            ? "Full gym access"
            : null,
        profile.trainingDays.length > 0
          ? profile.trainingDays.map((day) => labelFor(dayOptions, day)).join(" · ")
          : null,
      ].filter((line): line is string => Boolean(line))
    : [];

  const nutritionLines = profile
    ? [
        profile.cuisines.length > 0
          ? profile.cuisines.map((cuisine) => labelFor(cuisineOptions, cuisine)).join(" · ")
          : null,
        profile.restrictions.length > 0
          ? profile.restrictions.map((item) => labelFor(restrictionOptions, item)).join(" · ")
          : "No food restrictions",
        profile.calorieTarget
          ? `${profile.calorieTarget.toLocaleString()} kcal · ${profile.proteinTargetG} g protein (estimate)`
          : null,
      ].filter((line): line is string => Boolean(line))
    : [];

  return (
    <Screen scroll label="Account" title={displayName} showLogo={false}>
      <GlassCard style={styles.heroCard}>
        <ProfileAvatar
          name={profile?.name}
          email={user?.email}
          avatar={{
            avatarUrl: profile?.avatarUrl,
            avatarImageBase64: profile?.avatarImageBase64,
            avatarMimeType: profile?.avatarMimeType,
          }}
          onAvatarChange={(avatar) =>
            setProfile((current) => (current ? { ...current, ...avatar } : current))
          }
        />
        <Text style={[styles.email, { color: t.colors.textMuted }]}>{user?.email}</Text>
        <View style={styles.statsRow}>
          <StatPill label="Weight" value={profile?.weightKg ? `${profile.weightKg} kg` : "—"} />
          <StatPill
            label="Goal"
            value={profile?.goalWeightKg ? `${profile.goalWeightKg} kg` : "—"}
          />
          <StatPill label="Calories" value={profile?.calorieTarget ? `${profile.calorieTarget}` : "—"} />
        </View>
      </GlassCard>

      {needsProfile ? (
        <GlassCard>
          <Text style={[styles.bannerTitle, { color: t.colors.text }]}>Finish your profile</Text>
          <Text style={{ color: t.colors.textMuted, lineHeight: 22 }}>
            Some details are still placeholders from quick setup. Update them for accurate targets.
          </Text>
          <TextLink
            label="Complete profile"
            onPress={() => router.push({ pathname: "/(onboarding)", params: { edit: "1" } })}
          />
        </GlassCard>
      ) : null}

      <ProfileSection title="Body & goals" lines={bodyLines} />
      <ProfileSection title="Training" lines={trainingLines} />
      <ProfileSection title="Nutrition" lines={nutritionLines} />

      <GlassCard style={styles.actionsCard}>
        <TextLink
          label="Edit all details"
          onPress={() => router.push({ pathname: "/(onboarding)", params: { edit: "1" } })}
        />
      </GlassCard>

      <SecondaryButton label="Sign out" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: "stretch",
    gap: 4,
    paddingBottom: 20,
    paddingTop: 12,
  },
  email: {
    fontSize: 15,
    marginTop: 4,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statPill: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },
  sectionCard: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  sectionLine: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionsCard: {
    gap: 4,
  },
});
