import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { verifyToken } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

export const authRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Çok fazla başarısız giriş. 15 dakika bekleyin.' },
})

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

// POST /auth/login
authRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.safeParse(req.body)
    if (!body.success) {
      throw new AppError(400, 'Kullanıcı adı ve şifre gerekli.')
    }

    const { username, password } = body.data

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError(401, 'Kullanıcı adı veya şifre hatalı.')
    }

    if (user.status === 'PASSIVE' || user.status === 'SUSPENDED') {
      throw new AppError(403, 'Hesabınız aktif değil. Destek ile iletişime geçin.')
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          passwordChanged: user.passwordChanged,
        },
      },
    })
  } catch (err) {
    next(err)
  }
})

// POST /auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) throw new AppError(400, 'Refresh token gerekli.')

    const payload = verifyRefreshToken(refreshToken)

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, 'Geçersiz refresh token.')
    }

    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role })
    res.json({ success: true, data: { accessToken } })
  } catch (err) {
    next(err)
  }
})

// POST /auth/logout
authRouter.post('/logout', verifyToken, async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    res.json({ success: true, message: 'Çıkış yapıldı.' })
  } catch (err) {
    next(err)
  }
})

// POST /auth/change-password (ilk giriş zorunlu şifre değiştirme)
authRouter.post('/change-password', verifyToken, async (req, res, next) => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8, 'Şifre en az 8 karakter olmalı.'),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) {
      throw new AppError(400, body.error.errors[0].message)
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
    if (!user) throw new AppError(404, 'Kullanıcı bulunamadı.')

    const match = await bcrypt.compare(body.data.currentPassword, user.passwordHash)
    if (!match) throw new AppError(400, 'Mevcut şifre hatalı.')

    const newHash = await bcrypt.hash(body.data.newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, passwordChanged: true },
    })

    res.json({ success: true, message: 'Şifre güncellendi.' })
  } catch (err) {
    next(err)
  }
})

// POST /auth/register — self-service kayıt
authRouter.post('/register', rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), async (req, res, next) => {
  try {
    const schema = z.object({
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Sadece harf, rakam ve _ kullanılabilir.'),
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).max(100),
    })
    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, body.error.errors[0].message)

    const exists = await prisma.user.findFirst({
      where: { OR: [{ username: body.data.username }, { email: body.data.email }] },
    })
    if (exists) throw new AppError(409, 'Bu kullanıcı adı veya e-posta zaten kullanımda.')

    // FREE paketi bul
    const freePkg = await prisma.package.findFirst({ where: { name: 'FREE' } })
    if (!freePkg) throw new AppError(500, 'Paket bulunamadı.')

    const passwordHash = await bcrypt.hash(body.data.password, 10)
    const user = await prisma.user.create({
      data: {
        username: body.data.username,
        email: body.data.email,
        passwordHash,
        passwordChanged: true,
        packageId: freePkg.id,
        profile: {
          create: {
            slug: body.data.username,
            displayName: body.data.name,
          },
        },
      },
    })

    const accessToken = signAccessToken({ userId: user.id, role: user.role })
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role })
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } })

    res.status(201).json({
      success: true,
      data: {
        accessToken, refreshToken,
        user: { id: user.id, username: user.username, role: user.role, passwordChanged: true },
      },
    })
  } catch (err) { next(err) }
})
