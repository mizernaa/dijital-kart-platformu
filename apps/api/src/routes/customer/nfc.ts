import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'
import { sendEmail, escapeHtml } from '../../utils/email'

export const nfcRouter = Router()

// POST /customer/nfc — müşteri yeni NFC kart siparişi oluşturur
nfcRouter.post('/', async (req, res, next) => {
  try {
    const schema = z.object({
      cardModel: z.string().min(1).max(60),
      address: z.string().min(10, 'Lütfen tam bir teslimat adresi girin.').max(500),
      notes: z.string().max(500).optional(),
    })
    const body = schema.safeParse(req.body)
    if (!body.success) {
      throw new AppError(400, body.error.errors[0]?.message || 'Geçersiz sipariş bilgisi.')
    }

    const order = await prisma.nfcOrder.create({
      data: {
        userId: req.user!.userId,
        cardModel: body.data.cardModel,
        address: body.data.address,
        notes: body.data.notes || null,
        status: 'PENDING',
      },
    })

    // Admin'lere bildirim + e-posta
    const admins = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'SUPPORT'] } },
      select: { id: true, email: true },
    })
    const me = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { username: true, email: true },
    })
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          type: 'NEW_ORDER',
          message: `Yeni NFC kart siparişi: ${me?.username || ''} — ${body.data.cardModel}`,
        })),
      })
      const emails = admins.map(a => a.email).filter(Boolean) as string[]
      if (emails.length > 0) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        sendEmail({
          to: emails,
          subject: `🪪 Yeni NFC kart siparişi — ${body.data.cardModel}`,
          html: `<p><strong>${escapeHtml(me?.username)}</strong> (${escapeHtml(me?.email)}) yeni bir NFC kart siparişi verdi.</p>
                 <p>Model: <strong>${escapeHtml(body.data.cardModel)}</strong></p>
                 <p>Teslimat adresi: ${escapeHtml(body.data.address)}</p>
                 ${body.data.notes ? `<p>Not: ${escapeHtml(body.data.notes)}</p>` : ''}
                 <p><a href="${frontendUrl}/admin/nfc-orders">Siparişleri Görüntüle</a></p>`,
        })
      }
    }

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

// GET /customer/nfc — en son sipariş
nfcRouter.get('/', async (req, res, next) => {
  try {
    const order = await prisma.nfcOrder.findFirst({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
})

// GET /customer/nfc/history — tüm sipariş geçmişi
nfcRouter.get('/history', async (req, res, next) => {
  try {
    const orders = await prisma.nfcOrder.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, data: orders })
  } catch (err) {
    next(err)
  }
})
