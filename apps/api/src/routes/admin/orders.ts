import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const ordersRouter = Router()

// GET /admin/orders
ordersRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = 20
    const status = req.query.status as string | undefined

    const where = status ? { status: status as any } : {}
    const [orders, total, unreadCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
      prisma.order.count({ where: { isRead: false } }),
    ])

    res.json({ success: true, data: { orders, total, page, unreadCount } })
  } catch (err) { next(err) }
})

// PATCH /admin/orders/:id/status
ordersRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const schema = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']) })
    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz durum.')

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: body.data.status, isRead: true },
    })
    res.json({ success: true, data: order })
  } catch (err) { next(err) }
})

// PATCH /admin/orders/:id/read
ordersRouter.patch('/:id/read', async (req, res, next) => {
  try {
    await prisma.order.update({ where: { id: req.params.id }, data: { isRead: true } })
    res.json({ success: true })
  } catch (err) { next(err) }
})

// DELETE /admin/orders/:id
ordersRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Sipariş silindi.' })
  } catch (err) { next(err) }
})
