import { brand } from "@/lib/brand";
import { useAppTheme } from "@/lib/appTheme";
import { initialsFromName, resolveAvatarUrl, type AvatarFields } from "@/lib/avatar";
import { clearProfileAvatar, uploadProfileAvatar } from "@/lib/api";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProfileAvatarProps = {
  name: string | null | undefined;
  email: string | null | undefined;
  avatar: AvatarFields;
  onAvatarChange: (avatar: AvatarFields) => void;
};

function normalizeMimeType(mimeType: string | undefined | null) {
  if (!mimeType) return "image/jpeg";
  if (mimeType === "image/heic" || mimeType === "image/heif") return "image/jpeg";
  return mimeType;
}

export function ProfileAvatar({
  name,
  email,
  avatar,
  onAvatarChange,
}: ProfileAvatarProps) {
  const t = useAppTheme();
  const [busy, setBusy] = useState(false);
  const resolved = resolveAvatarUrl(avatar);
  const initials = initialsFromName(name, email);

  async function uploadFromAsset(asset: ImagePicker.ImagePickerAsset) {
    setBusy(true);
    try {
      const updated = await uploadProfileAvatar(
        asset.uri,
        normalizeMimeType(asset.mimeType),
      );
      onAvatarChange({
        avatarUrl: updated.avatarUrl ?? null,
        avatarImageBase64: updated.avatarImageBase64 ?? null,
        avatarMimeType: updated.avatarMimeType ?? null,
      });
    } catch (error) {
      Alert.alert(
        "Photo",
        error instanceof Error ? error.message : "Could not update your photo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function pick(source: "library" | "camera") {
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Camera access", "Allow camera access to take a profile photo.");
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
        });
        if (result.canceled || !result.assets[0]) return;
        await uploadFromAsset(result.assets[0]);
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Photos access", "Allow photo library access to choose a profile picture.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled || !result.assets[0]) return;
      await uploadFromAsset(result.assets[0]);
    } catch (error) {
      Alert.alert(
        "Photo",
        error instanceof Error ? error.message : "Could not open the photo picker.",
      );
    }
  }

  async function removePhoto() {
    setBusy(true);
    try {
      const updated = await clearProfileAvatar();
      onAvatarChange({
        avatarUrl: updated.avatarUrl ?? null,
        avatarImageBase64: updated.avatarImageBase64 ?? null,
        avatarMimeType: updated.avatarMimeType ?? null,
      });
    } catch (error) {
      Alert.alert(
        "Photo",
        error instanceof Error ? error.message : "Could not remove your photo.",
      );
    } finally {
      setBusy(false);
    }
  }

  function openMenu() {
    if (busy) return;

    const options = ["Choose from library", "Take photo", ...(resolved ? ["Remove photo"] : []), "Cancel"];
    const cancelIndex = options.length - 1;
    const destructiveIndex = resolved ? 2 : undefined;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
          destructiveButtonIndex: destructiveIndex,
          title: "Profile photo",
        },
        (index) => {
          if (index === 0) void pick("library");
          if (index === 1) void pick("camera");
          if (resolved && index === 2) void removePhoto();
        },
      );
      return;
    }

    Alert.alert("Profile photo", undefined, [
      { text: "Choose from library", onPress: () => void pick("library") },
      { text: "Take photo", onPress: () => void pick("camera") },
      ...(resolved
        ? [{ text: "Remove photo", style: "destructive" as const, onPress: () => void removePhoto() }]
        : []),
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
        disabled={busy}
        onPress={openMenu}
        style={({ pressed }) => [styles.ring, pressed ? styles.pressed : null]}
      >
        {resolved ? (
          <Image source={{ uri: resolved }} style={styles.image} />
        ) : (
          <View style={[styles.fallback, { backgroundColor: t.isDark ? "#1A1A1A" : "#E8E4DC" }]}>
            <Text style={[styles.initials, { color: t.colors.text }]}>{initials}</Text>
          </View>
        )}
        {busy ? (
          <View style={styles.busyOverlay}>
            <ActivityIndicator color={brand.lime} />
          </View>
        ) : null}
      </Pressable>
      <Text style={[styles.hint, { color: t.colors.textMuted }]}>Tap photo to update</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  ring: {
    borderColor: brand.lime,
    borderRadius: 56,
    borderWidth: 3,
    height: 112,
    overflow: "hidden",
    width: 112,
  },
  pressed: {
    opacity: 0.88,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  fallback: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  initials: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 1,
  },
  busyOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
  },
  hint: {
    fontSize: 13,
    fontWeight: "500",
  },
});
