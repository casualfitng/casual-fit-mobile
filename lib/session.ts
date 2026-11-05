import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_KEY = "casualfit.access";
const REFRESH_KEY = "casualfit.refresh";

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export async function saveSession(access: string, refresh: string) {
  accessToken = access;
  await AsyncStorage.multiSet([
    [ACCESS_KEY, access],
    [REFRESH_KEY, refresh],
  ]);
}

export async function loadRefreshToken() {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function clearSession() {
  accessToken = null;
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
}
