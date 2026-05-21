import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const nfcOrdersRouter = Router()

// GET /admin/nfc-orders?status=PENDING&page=1
nfcOrdersRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = 20
    const skip = (page - 1) * limit
    const status = req.query.status as string | undefined

    const where: any = {}
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.nfcOrder.findMany({
        where,
        include: { user: { select: { id: true, username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.nfcOrder.count({ where }),
    ])

    res.json({
      success: true,
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// POST /admin/nfc-orders — yeni sipariş oluştur
nfcOrdersRouter.post('/', async (req, res, next) => {
  try {
    const schema = z.object({
      userId: z.string().min(1),
      address: z.string().min(1).max(500),
      notes: z.string().max(1000).optional(),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz veri.', body.error.errors)

    const user = await prisma.user.findUnique({ where: { id: body.data.userId } })
    if (!user) throw new AppError(404, 'Kullanıcı bulunamadı.')

    const order = await prisma.nfcOrder.create({
      data: {
        userId: body.data.userId,
        address: body.data.address,
        notes: body.data.notes,
      },
      include: { user: { select: { id: true, username: true, email: true } } },
    })

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

// PUT /admin/nfc-orders/:id — güncelle
nfcOrdersRouter.put('/:id', async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['PENDING', 'PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
      trackingNumber: z.string().max(100).nullable().optional(),
      notes: z.string().max(1000).nullable().optional(),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz veri.', body.error.errors)

    const order = await prisma.nfcOrder.findUnique({ where: { id: req.params.id } })
    if (!order) throw new AppError(404, 'Sipariş bulunamadı.')

    const updated = await prisma.nfcOrder.update({
      where: { id: req.params.id },
      data: body.data,
      include: { user: { select: { id: true, username: true, email: true } } },
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})
