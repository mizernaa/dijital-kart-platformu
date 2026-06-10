import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload, UserRole } from '@dkp/types'
import { AppError } from './errorHandler'
import { ACCESS_SECRET } from '../utils/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function verifyToken(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'Yetkilendirme token\'ı gerekli.')
  }

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as JwtPayload
    req.user = payload
    next()
  } catch {
    throw new AppError(401, 'Geçersiz veya süresi dolmuş token.')
  }
}

export function requireRole(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new AppError(401, 'Kimlik doğrulaması gerekli.')
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Bu işlem için yetkiniz yok.')
    }
    next()
  }
}
