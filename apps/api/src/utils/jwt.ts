import jwt from 'jsonwebtoken'
import { JwtPayload, UserRole } from '@dkp/types'

// Production'da gerçek secret zorunlu — dev fallback ile imzalanan token'lar
// bilinen anahtarla taklit edilebilirdi (kritik açık).
function requiredSecret(name: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET', devFallback: string): string {
  const v = process.env[name]
  if (v && v.length >= 16) return v
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} production ortamında tanımlı (ve en az 16 karakter) olmalı.`)
  }
  return devFallback
}

export const ACCESS_SECRET = requiredSecret('JWT_ACCESS_SECRET', 'access-secret-dev')
const REFRESH_SECRET = requiredSecret('JWT_REFRESH_SECRET', 'refresh-secret-dev')

export function signAccessToken(payload: { userId: string; role: UserRole }): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any,
  })
}

export function signRefreshToken(payload: { userId: string; role: UserRole }): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  })
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload
}
