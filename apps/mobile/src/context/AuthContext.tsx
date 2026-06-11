import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, setSessionExpiredHandler } from '../api/client'
import {
  saveSession,
  clearSession,
  getStoredUser,
  getAccessToken,
  getRefreshToken,
  StoredUser,
} from '../api/storage'

type AuthState = {
  user: StoredUser | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Açılışta kayıtlı oturumu yükle.
  useEffect(() => {
    ;(async () => {
      const [token, storedUser] = await Promise.all([getAccessToken(), getStoredUser()])
      if (token && storedUser) setUser(storedUser)
      setLoading(false)
    })()
  }, [])

  // 401 + refresh başarısız olursa otomatik çıkış.
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password })
    const { accessToken, refreshToken, user: u } = data.data
    if (u.role !== 'CUSTOMER') {
      throw new Error('Bu uygulama yalnızca müşteri hesapları içindir.')
    }
    await saveSession(accessToken, refreshToken, u)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken()
      if (refreshToken) await api.post('/auth/logout', { refreshToken })
    } catch {
      // sunucu hatası olsa da yerel oturumu temizle
    }
    await clearSession()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
