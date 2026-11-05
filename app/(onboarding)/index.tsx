import {
  AuthField,
  AuthFormError,
  AuthHint,
  AuthPrimaryButton,
  AuthTextLink,
} from "@/components/auth/AuthForm";
import { BrandChoices, BrandMultiChoices } from "@/components/onboarding/BrandChoices";
import { OnboardingLogo, OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { ApiError, api } from "@/lib/api";
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
import {
  draftToSaveBody,
  emptyDraft,
  fullSteps,
  quickDefaultsFromDraft,
  skipDefaults,
  titleForStep,
  validateFullStep,
  validateQuickStep,
  type OnboardingDraft,
} from "@/lib/onboardingDraft";
import { brand } from "@/lib/brand";
import { estimateTargets, type ActivityLevel, type Gender } from "@/lib/targets";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, useColorScheme } from "react-native";

type Mode = "choose" | "quick" | "full";

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
  onboardingComplete: boolean;
};

export default function OnboardingScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { finishOnboarding } = useAuth();
  const router = useRouter();
  const isDark = (useColorScheme() ?? "dark") === "dark";

  const [mode, setMode] = useState<Mode>(edit === "1" ? "full" : "choose");
  const [quickStep, setQuickStep] = useState(0);
  const [fullStep, setFullStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (edit !== "1") return;
    let active = true;
    api<SavedProfile>("/profile")
      .then((profile) => {
        if (!active || (!profile.onboardingComplete && !profile.name)) return;
        setDraft({
          name: profile.name ?? "",
          age: profile.age ? String(profile.age) : "",
          gender: profile.gender,
          heightCm: profile.heightCm ? String(profile.heightCm) : "",
          weightKg: profile.weightKg ? String(profile.weightKg) : "",
          goalWeightKg: profile.goalWeightKg ? String(profile.goalWeightKg) : "",
          goals: profile.goals,
          experience: profile.experience,
          location: profile.location,
          equipment: profile.equipment,
          trainingDays: profile.trainingDays.length > 0 ? profile.trainingDays : emptyDraft().trainingDays,
          activityLevel: profile.activityLevel,
          cuisines: profile.cuisines,
          restrictions: profile.restrictions,
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [edit]);

  function patch(next: Partial<OnboardingDraft>) {
    setDraft((current) => ({ ...current, ...next }));
    setError(null);
  }

  function toggleEquipment(next: string[]) {
    const added = next.find((item) => !draft.equipment.includes(item));
    if (added === "no_equipment") {
      patch({ equipment: ["no_equipment"] });
      return;
    }
    patch({ equipment: next.filter((item) => item !== "no_equipment") });
  }

  async function persist(body: ReturnType<typeof draftToSaveBody>) {
    setBusy(true);
    setError(null);
    try {
      await api("/profile", { method: "PUT", body });
      finishOnboarding();
      if (edit === "1") router.replace("/(tabs)/profile");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not save your details.");
    } finally {
      setBusy(false);
    }
  }

  function confirmSkip() {
    Alert.alert(
      "Skip for now?",
      "We will use sensible defaults so you can train today. You can finish your profile anytime in the Profile tab.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          style: "default",
          onPress: () => void persist(skipDefaults(draft.name)),
        },
      ],
    );
  }

  if (mode === "choose") {
    return (
      <OnboardingShell
        kicker="Set up"
        title="How much do you want to share?"
        hint="Quick start gets you training in about a minute. You can always add the rest later."
      >
        <OnboardingLogo />
        <AuthField
          label="What should we call you?"
          value={draft.name}
          onChangeText={(name) => patch({ name })}
          autoComplete="name"
          textContentType="name"
        />
        <AuthFormError message={error} />
        <AuthPrimaryButton
          label="Quick start"
          disabled={busy || draft.name.trim().length === 0}
          onPress={() => {
            setError(null);
            setQuickStep(0);
            setMode("quick");
          }}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setError(null);
            setFullStep(0);
            setMode("full");
          }}
          style={styles.secondaryButton}
        >
          <Text style={[styles.secondaryLabel, { color: isDark ? brand.paper : brand.ink }]}>
            Full questionnaire
          </Text>
        </Pressable>
        <AuthTextLink
          label="Skip for now — use defaults"
          onPress={() => {
            if (draft.name.trim().length === 0) {
              setError("Add a name first, or type anything you like.");
              return;
            }
            confirmSkip();
          }}
        />
      </OnboardingShell>
    );
  }

  if (mode === "quick") {
    const problem = validateQuickStep(quickStep, draft);
    const isLast = quickStep === 2;
    return (
      <OnboardingShell
        kicker={`Quick · step ${quickStep + 1} of 3`}
        title={
          quickStep === 0
            ? "Goals"
            : quickStep === 1
              ? "Training"
              : "Ready to go"
        }
        hint={
          quickStep === 2
            ? "We use typical height and weight estimates until you add yours in Profile."
            : undefined
        }
        progress={{ current: quickStep + 1, total: 3 }}
      >
        <AuthFormError message={error} />
        {quickStep === 0 ? (
          <>
            <AuthHint>Pick what matters most right now. You can add more later.</AuthHint>
            <BrandMultiChoices
              options={goalOptions}
              value={draft.goals}
              onChange={(goals) => patch({ goals })}
            />
          </>
        ) : null}
        {quickStep === 1 ? (
          <>
            <Text style={[styles.sectionLabel, { color: isDark ? brand.paper : brand.ink }]}>
              Experience
            </Text>
            <BrandChoices
              options={experienceOptions}
              value={draft.experience}
              onChange={(experience) => patch({ experience })}
            />
            <Text style={[styles.sectionLabel, { color: isDark ? brand.paper : brand.ink }]}>
              Where you train
            </Text>
            <BrandChoices
              options={locationOptions}
              value={draft.location}
              onChange={(location) => patch({ location, equipment: location === "gym" ? [] : draft.equipment })}
            />
            {draft.location && draft.location !== "gym" ? (
              <>
                <Text style={[styles.sectionLabel, { color: isDark ? brand.paper : brand.ink }]}>
                  Equipment at home
                </Text>
                <BrandMultiChoices
                  options={equipmentChoices}
                  value={draft.equipment}
                  onChange={toggleEquipment}
                />
              </>
            ) : null}
          </>
        ) : null}
        {quickStep === 2 ? (
          <AuthHint>
            {`${draft.name.trim()}, we will start you on a ${labelFor(experienceOptions, draft.experience ?? "beginner")} plan for ${labelFor(locationOptions, draft.location ?? "gym")}.`}
          </AuthHint>
        ) : null}
        {quickStep > 0 ? (
          <AuthTextLink label="Back" onPress={() => setQuickStep((s) => s - 1)} />
        ) : (
          <AuthTextLink label="Back to options" onPress={() => setMode("choose")} />
        )}
        <AuthPrimaryButton
          label={isLast ? (busy ? "Saving…" : "Start training") : "Continue"}
          disabled={Boolean(problem) || busy}
          onPress={() => {
            if (problem) {
              setError(problem);
              return;
            }
            if (isLast) {
              void persist(quickDefaultsFromDraft(draft));
              return;
            }
            setQuickStep((s) => s + 1);
          }}
        />
      </OnboardingShell>
    );
  }

  const current = fullSteps[fullStep];
  const problem = validateFullStep(current, draft);
  const estimate =
    current === "review" && !problem
      ? estimateTargets({
          gender: draft.gender as Gender,
          age: Number(draft.age),
          heightCm: Number(draft.heightCm),
          weightKg: Number(draft.weightKg),
          activityLevel: draft.activityLevel as ActivityLevel,
          goals: draft.goals,
        })
      : null;

  function goForward() {
    setFullStep((value) => {
      const next = value + 1;
      if (fullSteps[next] === "equipment" && draft.location === "gym") return next + 1;
      return next;
    });
  }

  function goBack() {
    setFullStep((value) => {
      const previous = value - 1;
      if (fullSteps[previous] === "equipment" && draft.location === "gym") return previous - 1;
      return previous;
    });
  }

  return (
    <OnboardingShell
      kicker={edit === "1" ? "Profile" : `Full · step ${fullStep + 1} of ${fullSteps.length}`}
      title={titleForStep(current)}
      progress={{ current: fullStep + 1, total: fullSteps.length }}
    >
      <AuthFormError message={error} />
      {current === "about" ? (
        <>
          <AuthField label="Name" value={draft.name} onChangeText={(name) => patch({ name })} />
          <AuthField
            label="Age"
            value={draft.age}
            onChangeText={(age) => patch({ age })}
            keyboardType="number-pad"
          />
          <BrandChoices
            options={genderOptions}
            value={draft.gender}
            onChange={(gender) => patch({ gender })}
          />
        </>
      ) : null}
      {current === "body" ? (
        <>
          <AuthField
            label="Height (cm)"
            value={draft.heightCm}
            onChangeText={(heightCm) => patch({ heightCm })}
            keyboardType="decimal-pad"
          />
          <AuthField
            label="Weight (kg)"
            value={draft.weightKg}
            onChangeText={(weightKg) => patch({ weightKg })}
            keyboardType="decimal-pad"
          />
          <AuthField
            label="Goal weight (kg)"
            value={draft.goalWeightKg}
            onChangeText={(goalWeightKg) => patch({ goalWeightKg })}
            keyboardType="decimal-pad"
          />
        </>
      ) : null}
      {current === "goals" ? (
        <BrandMultiChoices options={goalOptions} value={draft.goals} onChange={(goals) => patch({ goals })} />
      ) : null}
      {current === "experience" ? (
        <BrandChoices
          options={experienceOptions}
          value={draft.experience}
          onChange={(experience) => patch({ experience })}
        />
      ) : null}
      {current === "place" ? (
        <BrandChoices
          options={locationOptions}
          value={draft.location}
          onChange={(location) => patch({ location })}
        />
      ) : null}
      {current === "equipment" ? (
        <BrandMultiChoices
          options={equipmentChoices}
          value={draft.equipment}
          onChange={toggleEquipment}
        />
      ) : null}
      {current === "days" ? (
        <BrandMultiChoices
          options={dayOptions}
          value={draft.trainingDays}
          onChange={(trainingDays) => patch({ trainingDays })}
        />
      ) : null}
      {current === "activity" ? (
        <BrandChoices
          options={activityOptions}
          value={draft.activityLevel}
          onChange={(activityLevel) => patch({ activityLevel })}
        />
      ) : null}
      {current === "food" ? (
        <>
          <Text style={[styles.sectionLabel, { color: isDark ? brand.paper : brand.ink }]}>
            Preferred food
          </Text>
          <BrandMultiChoices
            options={cuisineOptions}
            value={draft.cuisines}
            onChange={(cuisines) => patch({ cuisines })}
          />
          <AuthHint>Leave allergies blank if none apply.</AuthHint>
          <BrandMultiChoices
            options={restrictionOptions}
            value={draft.restrictions}
            onChange={(restrictions) => patch({ restrictions })}
          />
        </>
      ) : null}
      {current === "review" && estimate ? (
        <Text style={[styles.summary, { color: isDark ? brand.paper : brand.ink }]}>
          {`${draft.name.trim()}, ${labelFor(experienceOptions, draft.experience ?? "")}. Estimated target ${estimate.calorieTarget.toLocaleString()} kcal and ${estimate.proteinTargetG} g protein a day. This is an estimate, not a prescription.`}
        </Text>
      ) : null}
      {fullStep > 0 ? (
        <AuthTextLink label="Back" onPress={goBack} />
      ) : edit !== "1" ? (
        <AuthTextLink label="Back to options" onPress={() => setMode("choose")} />
      ) : null}
      <AuthPrimaryButton
        label={current === "review" ? (busy ? "Saving…" : "Save and continue") : "Continue"}
        disabled={Boolean(problem) || busy}
        onPress={() => {
          if (problem) {
            setError(problem);
            return;
          }
          if (current === "review") {
            void persist(draftToSaveBody(draft));
            return;
          }
          goForward();
        }}
      />
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  secondaryButton: {
    alignItems: "center",
    borderColor: brand.lime,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 52,
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
  },
});
