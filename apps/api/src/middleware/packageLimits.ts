import { Request, Response, NextFunction } from 'express'
import { prisma } from '@dkp/database'
import { AppError } from './errorHandler'
import { Package } from '@dkp/types'

declare global {
  namespace Express {
    interface Request {
      userPackage?: Package
    }
  }
}

export async function attachUserPackage(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.userId) return next()
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { package: true },
    })
    if (user?.package) {
      req.userPackage = user.package as unknown as Package
    }
    next()
  } catch (err) {
    next(err)
  }
}

export function requirePackageFeature(field: keyof Package, message: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userPackage) {
      throw new AppError(403, message)
    }
    const value = req.userPackage[field]
    if (!value) {
      throw new AppError(403, message)
    }
    next()
  }
}

export function clampAnalyticsDays(req: Request, _res: Response, next: NextFunction): void {
  const maxDays = req.userPackage?.analyticsRetentionDays ?? 7
  const requested = parseInt(req.query.days as string) || 30
  req.query.days = String(Math.min(requested, maxDays))
  next()
}
