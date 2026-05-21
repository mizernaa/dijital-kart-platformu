import { Router } from 'express'
import { prisma } from '@dkp/database'

export const platformAnalyticsRouter = Router()

// GET /admin/analytics?days=30
platformAnalyticsRouter.get('/', async (req, res, next) => {
  try {
    const days = Math.min(90, parseInt(req.query.days as string) || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const [dailyViews, topProfiles, eventsByType, userGrowth] = await Promise.all([
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt")::text as date, COUNT(*) as count
        FROM "AnalyticsEvent"
        WHERE "eventType" = 'PAGE_VIEW'::"EventType" AND "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      prisma.$queryRaw<{ slug: string; displayName: string; count: bigint }[]>`
        SELECT p.slug, p."displayName", COUNT(*) as count
        FROM "AnalyticsEvent" a
        JOIN "Profile" p ON p.id = a."profileId"
        WHERE a."eventType" = 'PAGE_VIEW'::"EventType" AND a."createdAt" >= ${since}
        GROUP BY p.slug, p."displayName"
        ORDER BY count DESC
        LIMIT 10
      `,
      prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where: { createdAt: { gte: since } },
        _count: { eventType: true },
      }),
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE("createdAt")::text as date, COUNT(*) as count
        FROM "User"
        WHERE role = 'CUSTOMER' AND "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ])

    res.json({
      success: true,
      data: {
        dailyViews: dailyViews.map(r => ({ date: r.date, count: Number(r.count) })),
        topProfiles: topProfiles.map(r => ({ slug: r.slug, displayName: r.displayName, count: Number(r.count) })),
        eventsByType: Object.fromEntries(eventsByType.map(e => [e.eventType, e._count.eventType])),
        userGrowth: userGrowth.map(r => ({ date: r.date, count: Number(r.count) })),
      },
    })
  } catch (err) {
    next(err)
  }
})
