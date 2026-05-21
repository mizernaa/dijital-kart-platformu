import { Router } from 'express'
import { prisma } from '@dkp/database'

export const nfcRouter = Router()

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
