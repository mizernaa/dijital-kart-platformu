import Cookies from 'js-cookie'

export interface AuthUser {
  id: string
  username: string
  role: 'SUPER_ADMIN' | 'SUPPORT' | 'CUSTOMER'
  passwordChanged: boolean
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('authUser')
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setAuth(tokens: { accessToken: string; refreshToken: string }, user: AuthUser) {
  Cookies.set('accessToken', tokens.accessToken, { expires: 1 / 96 })
  Cookies.set('refreshToken', tokens.refreshToken, { expires: 7 })
  localStorage.setItem('authUser', JSON.stringify(user))
}

export function clearAuth() {
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
  localStorage.removeItem('authUser')
}

export function isLoggedIn(): boolean {
  return !!Cookies.get('accessToken')
}
