import jwt from 'jsonwebtoken'
import { JwtPayload, UserRole } from '@dkp/types'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-dev'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-dev'

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
