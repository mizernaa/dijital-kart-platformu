import { Router } from 'express'
import { prisma } from '@dkp/database'
import { createClient } from 'redis'

export const healthRouter = Router()

healthRouter.get('/', async (_req, res) => {
  const checks: Record<string, string> = {}

  // DB check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.db = 'connected'
  } catch {
    checks.db = 'disconnected'
  }

  // Redis check (optional, skip if not configured)
  if (process.env.REDIS_URL) {
    try {
      const redis = createClient({ url: process.env.REDIS_URL, socket: { connectTimeout: 3000 } })
      await redis.connect()
      await redis.ping()
      await redis.disconnect()
      checks.redis = 'connected'
    } catch {
      checks.redis = 'disconnected'
    }
  } else {
    checks.redis = 'not_configured'
  }

  const allHealthy = Object.values(checks).every(v => v === 'connected' || v === 'not_configured')

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  })
})
