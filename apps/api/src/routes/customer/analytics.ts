import { Router } from 'express'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const analyticsRouter = Router()

// GET /customer/analytics?days=30
analyticsRouter.get('/', async (req, res, next) => {
  try {
    const days = Math.min(365, parseInt(req.query.days as string) || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const [
      totalViews,
      vcardDownloads,
      eventsBySource,
      eventsByType,
      recentEvents,
      deviceEvents,
      browserEvents,
      hourlyEvents,
      leadCount,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: { profileId: profile.id, eventType: 'PAGE_VIEW', createdAt: { gte: since } },
      }),
      prisma.analyticsEvent.count({
        where: { profileId: profile.id, eventType: 'VCARD_DOWNLOAD', createdAt: { gte: since } },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['source'],
        where: { profileId: profile.id, eventType: 'PAGE_VIEW', createdAt: { gte: since } },
        _count: { source: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where: { profileId: profile.id, createdAt: { gte: since } },
        _count: { eventType: true },
      }),
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT
          DATE("createdAt")::text as date,
          COUNT(*) as count
        FROM "AnalyticsEvent"
        WHERE "profileId" = ${profile.id}
          AND "eventType" = 'PAGE_VIEW'::"EventType"
          AND "createdAt" >= ${since}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
      prisma.analyticsEvent.groupBy({
        by: ['device'],
        where: { profileId: profile.id, eventType: 'PAGE_VIEW', createdAt: { gte: since } },
        _count: { device: true },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['browser'],
        where: { profileId: profile.id, eventType: 'PAGE_VIEW', createdAt: { gte: since } },
        _count: { browser: true },
      }),
      prisma.$queryRaw<{ hour: number; count: bigint }[]>`
        SELECT
          EXTRACT(HOUR FROM "createdAt")::int as hour,
          COUNT(*) as count
        FROM "AnalyticsEvent"
        WHERE "profileId" = ${profile.id}
          AND "eventType" = 'PAGE_VIEW'::"EventType"
          AND "createdAt" >= ${since}
        GROUP BY EXTRACT(HOUR FROM "createdAt")
        ORDER BY hour ASC
      `,
      prisma.leadCapture.count({ where: { profileId: profile.id } }),
    ])

    const uniqueResult = await prisma.analyticsEvent.findMany({
      where: { profileId: profile.id, eventType: 'PAGE_VIEW', createdAt: { gte: since } },
      select: { ipHash: true },
      distinct: ['ipHash'],
    })
    const uniqueVisitors = uniqueResult.filter(r => r.ipHash).length

    const sourceCounts: Record<string, number> = {}
    for (const row of eventsBySource) {
      sourceCounts[row.source || 'direct'] = row._count.source
    }

    const buttonEvents = await prisma.analyticsEvent.groupBy({
      by: ['buttonLabel'],
      where: {
        profileId: profile.id,
        eventType: 'BUTTON_CLICK',
        createdAt: { gte: since },
        buttonLabel: { not: null },
      },
      _count: { buttonLabel: true },
      orderBy: { _count: { buttonLabel: 'desc' } },
      take: 10,
    })

    // Cihaz dağılımı
    const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0, other: 0 }
    for (const row of deviceEvents) {
      const d = (row.device || 'desktop').toLowerCase()
      if (d === 'mobile') deviceBreakdown.mobile += row._count.device
      else if (d === 'tablet') deviceBreakdown.tablet += row._count.device
      else if (d === 'desktop') deviceBreakdown.desktop += row._count.device
      else deviceBreakdown.other += row._count.device
    }

    const browserBreakdown: Record<string, number> = {}
    for (const row of browserEvents) {
      browserBreakdown[row.browser || 'unknown'] = row._count.browser
    }

    // Saatlik dağılım — 0-23 tüm saatler (eksik olanlar 0)
    const hourMap: Record<number, number> = {}
    for (const row of hourlyEvents) {
      hourMap[row.hour] = Number(row.count)
    }
    const hourlyDistribution = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: hourMap[h] || 0,
    }))

    res.json({
      success: true,
      data: {
        totalViews,
        uniqueVisitors,
        vcardDownloads,
        sourceCounts,
        dailyViews: recentEvents.map(r => ({
          date: r.date,
          count: Number(r.count),
        })),
        topButtons: buttonEvents.map(e => ({
          label: e.buttonLabel!,
          count: e._count.buttonLabel,
        })),
        eventsByType: Object.fromEntries(
          eventsByType.map(e => [e.eventType, e._count.eventType])
        ),
        deviceBreakdown,
        browserBreakdown,
        hourlyDistribution,
        leadCount,
      },
    })
  } catch (err) {
    next(err)
  }
})

// GET /customer/analytics/export — CSV
analyticsRouter.get('/export', async (req, res, next) => {
  try {
    const days = Math.min(365, parseInt(req.query.days as string) || 30)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const events = await prisma.analyticsEvent.findMany({
      where: { profileId: profile.id, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    })

    const header = 'Tarih,Olay Türü,Kaynak,Buton,Cihaz,Tarayıcı,Ülke\n'
    const rows = events.map(e => [
      `"${e.createdAt.toISOString()}"`,
      `"${e.eventType}"`,
      `"${e.source || ''}"`,
      `"${(e.buttonLabel || '').replace(/"/g, '""')}"`,
      `"${e.device || ''}"`,
      `"${e.browser || ''}"`,
      `"${e.country || ''}"`,
    ].join(',')).join('\n')

    const csv = '﻿' + header + rows

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${days}d.csv"`)
    res.send(csv)
  } catch (err) {
    next(err)
  }
})
