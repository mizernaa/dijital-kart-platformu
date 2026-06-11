import axios from 'axios'
import { API_BASE_URL } from '../config'
import {
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  clearSession,
} from './storage'

// Web paneldeki lib/api.ts ile aynı mantık: her isteğe Bearer token ekle,
// 401'de refresh token ile yenilemeyi dene, başarısızsa oturumu temizle.
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// Oturum geçersiz olduğunda AuthContext'in haberdar olması için kanca.
let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry && !isRefreshing) {
      original._retry = true
      isRefreshing = true
      try {
        const refreshToken = await getRefreshToken()
        if (!refreshToken) throw new Error('no refresh token')
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
        const newToken = data?.data?.accessToken
        if (!newToken) throw new Error('no new token')
        await saveAccessToken(newToken)
        isRefreshing = false
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshErr) {
        isRefreshing = false
        await clearSession()
        onSessionExpired?.()
        return Promise.reject(refreshErr)
      }
    }
    return Promise.reject(error)
  }
)

// Sunucu hata mesajını kullanıcıya gösterilebilir metne çevirir.
export function apiErrorMessage(error: unknown, fallback = 'Bir hata oluştu.'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback
  }
  return fallback
}
