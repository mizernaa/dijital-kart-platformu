import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const devicesRouter = Router()

// POST /customer/devices — mobil push token kaydı (upsert)
devicesRouter.post('/', async (req, res, next) => {
  try {
    const schema = z.object({
      token: z.string().min(10).max(300).regex(/^(ExponentPushToken|ExpoPushToken)\[/, 'Geçersiz Expo push token.'),
      platform: z.enum(['ios', 'android']).optional(),
    })
    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz cihaz verisi.')

    const saved = await prisma.pushToken.upsert({
      where: { token: body.data.token },
      // Token başka kullanıcıya kayıtlıysa (cihaz el değiştirdi) sahipliği güncelle
      update: { userId: req.user!.userId, platform: body.data.platform || 'unknown' },
      create: {
        userId: req.user!.userId,
        token: body.data.token,
        platform: body.data.platform || 'unknown',
      },
    })
    res.json({ success: true, data: { id: saved.id } })
  } catch (err) {
    next(err)
  }
})

// DELETE /customer/devices — çıkışta token'ı sil
devicesRouter.delete('/', async (req, res, next) => {
  try {
    const token = (req.body?.token as string) || ''
    if (token) {
      await prisma.pushToken.deleteMany({ where: { token, userId: req.user!.userId } })
    }
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
