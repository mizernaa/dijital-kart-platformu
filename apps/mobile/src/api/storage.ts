import * as SecureStore from 'expo-secure-store'

// Token'ları cihazda şifreli saklamak için ince bir sarmalayıcı.
const ACCESS_KEY = 'qv_access_token'
const REFRESH_KEY = 'qv_refresh_token'
const USER_KEY = 'qv_user'

export type StoredUser = {
  id: string
  username: string
  role: string
  passwordChanged: boolean
}

export async function saveSession(
  accessToken: string,
  refreshToken: string,
  user: StoredUser
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ])
}

export async function saveAccessToken(accessToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken)
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY)
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY)
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredUser
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ])
}
