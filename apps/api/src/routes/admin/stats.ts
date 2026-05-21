import { Router } from 'express'
import { prisma } from '@dkp/database'

export const statsRouter = Router()

// GET /admin/stats — platform geneli özet istatistikler
statsRouter.get('/', async (req, res, next) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOf30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers, activeUsers, trialUsers, passiveUsers, suspendedUsers,
      newThisMonth, publishedProfiles, totalProfiles,
      viewsToday, viewsThisWeek, viewsThisMonth,
      totalLeads, unreadLeads, pendingNfcOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'TRIAL' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'PASSIVE' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'SUSPENDED' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } }),
      prisma.profile.count({ where: { isPublished: true } }),
      prisma.profile.count(),
      prisma.analyticsEvent.count({ where: { eventType: 'PAGE_VIEW', createdAt: { gte: startOfToday } } }),
      prisma.analyticsEvent.count({ where: { eventType: 'PAGE_VIEW', createdAt: { gte: startOfWeek } } }),
      prisma.analyticsEvent.count({ where: { eventType: 'PAGE_VIEW', createdAt: { gte: startOf30Days } } }),
      prisma.leadCapture.count(),
      prisma.leadCapture.count({ where: { isRead: false } }),
      prisma.nfcOrder.count({ where: { status: 'PENDING' } }),
    ])

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, trial: trialUsers, passive: passiveUsers, suspended: suspendedUsers, newThisMonth },
        profiles: { total: totalProfiles, published: publishedProfiles },
        views: { today: viewsToday, thisWeek: viewsThisWeek, thisMonth: viewsThisMonth },
        leads: { total: totalLeads, unread: unreadLeads },
        nfcOrders: { pending: pendingNfcOrders },
      },
    })
  } catch (err) {
    next(err)
  }
})
