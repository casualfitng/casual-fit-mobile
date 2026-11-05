import { getAccessToken } from "./session";
import { File, UploadType } from "expo-file-system";

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string | string[];
  };
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    throw new ApiError(message ?? "Something went wrong.", response.status);
  }
  return data as T;
}

export async function uploadProfileAvatar(
  uri: string,
  mimeType = "image/jpeg",
): Promise<{
  avatarUrl: string | null;
  avatarImageBase64: string | null;
  avatarMimeType: string | null;
}> {
  const token = getAccessToken();
  const file = new File(uri);
  const result = await file.upload(`${baseUrl}/profile/avatar`, {
    uploadType: UploadType.MULTIPART,
    fieldName: "photo",
    mimeType,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = (() => {
    try {
      return JSON.parse(result.body) as {
        message?: string | string[];
        avatarUrl?: string | null;
        avatarImageBase64?: string | null;
        avatarMimeType?: string | null;
      };
    } catch {
      return {};
    }
  })();

  if (result.status < 200 || result.status >= 300) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    throw new ApiError(message ?? "Could not upload photo.", result.status);
  }

  return {
    avatarUrl: data.avatarUrl ?? null,
    avatarImageBase64: data.avatarImageBase64 ?? null,
    avatarMimeType: data.avatarMimeType ?? null,
  };
}

export async function clearProfileAvatar(): Promise<{
  avatarUrl: string | null;
  avatarImageBase64: string | null;
  avatarMimeType: string | null;
}> {
  return api<{
    avatarUrl: string | null;
    avatarImageBase64: string | null;
    avatarMimeType: string | null;
  }>("/profile/avatar", { method: "DELETE" });
}
