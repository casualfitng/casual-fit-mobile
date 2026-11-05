const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export type AvatarFields = {
  avatarUrl?: string | null;
  avatarImageBase64?: string | null;
  avatarMimeType?: string | null;
};

export function resolveAvatarUrl(fields: AvatarFields | string | null | undefined) {
  if (fields == null || typeof fields === "string") {
    const avatarUrl = typeof fields === "string" ? fields : null;
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
      return avatarUrl;
    }
    if (avatarUrl.startsWith("/uploads/")) {
      return null;
    }
    return `${baseUrl}${avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`}`;
  }

  if (fields.avatarImageBase64 && fields.avatarMimeType) {
    return `data:${fields.avatarMimeType};base64,${fields.avatarImageBase64}`;
  }

  if (fields.avatarUrl?.startsWith("http://") || fields.avatarUrl?.startsWith("https://")) {
    return fields.avatarUrl;
  }

  return null;
}

export function initialsFromName(name: string | null | undefined, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
