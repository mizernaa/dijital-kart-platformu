import { Router } from 'express'
import { prisma } from '@dkp/database'

export const notificationsRouter = Router()

// GET /customer/notifications
notificationsRouter.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    const unreadCount = notifications.filter(n => !n.isRead).length
    res.json({ success: true, data: { notifications, unreadCount } })
  } catch (err) {
    next(err)
  }
})

// PATCH /customer/notifications/read-all
notificationsRouter.patch('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// PATCH /customer/notifications/:id/read
notificationsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isRead: true },
    })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
