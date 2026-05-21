import { Router } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const usersRouter = Router()

// GET /admin/users — müşteri listesi
usersRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20)
    const search = req.query.search as string | undefined
    const status = req.query.status as string | undefined

    const where: Record<string, unknown> = { role: 'CUSTOMER' }
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) where.status = status

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { package: true },
      }),
      prisma.user.count({ where }),
    ])

    res.json({
      success: true,
      data: {
        users: users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          status: u.status,
          packageName: u.package.name,
          company: u.company,
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    })
  } catch (err) {
    next(err)
  }
})

// POST /admin/users — yeni müşteri oluştur
const createUserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/, 'Sadece küçük harf, rakam, _ ve - kullanılabilir.'),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  packageId: z.string(),
  status: z.enum(['ACTIVE', 'PASSIVE', 'SUSPENDED', 'TRIAL']).default('TRIAL'),
})

usersRouter.post('/', async (req, res, next) => {
  try {
    const body = createUserSchema.safeParse(req.body)
    if (!body.success) {
      const errors = Object.fromEntries(
        body.error.errors.map(e => [e.path.join('.'), e.message])
      )
      throw new AppError(400, 'Geçersiz giriş.', errors)
    }

    const { username, email, phone, company, notes, packageId, status } = body.data

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    })
    if (existing) {
      throw new AppError(409, 'Bu kullanıcı adı veya e-posta zaten kullanılıyor.')
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } })
    if (!pkg) throw new AppError(404, 'Paket bulunamadı.')

    // Geçici şifre oluştur
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!'
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: 'CUSTOMER',
        status,
        phone,
        company,
        notes,
        packageId,
        profile: {
          create: {
            slug: username,
            displayName: username,
          },
        },
      },
      include: { package: true },
    })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status,
          packageName: user.package.name,
          createdAt: user.createdAt,
        },
        tempPassword,
      },
      message: 'Müşteri oluşturuldu. Geçici şifreyi not alın.',
    })
  } catch (err) {
    next(err)
  }
})

// GET /admin/users/:id
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        package: true,
        profile: {
          select: { id: true, slug: true, displayName: true, isPublished: true },
        },
      },
    })
    if (!user) throw new AppError(404, 'Kullanıcı bulunamadı.')

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        company: user.company,
        notes: user.notes,
        role: user.role,
        status: user.status,
        passwordChanged: user.passwordChanged,
        packageName: user.package.name,
        packageDisplayName: user.package.displayName,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        profile: user.profile,
      },
    })
  } catch (err) {
    next(err)
  }
})

// PUT /admin/users/:id
usersRouter.put('/:id', async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      notes: z.string().optional(),
      packageId: z.string().optional(),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz giriş.')

    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) throw new AppError(404, 'Kullanıcı bulunamadı.')

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: body.data,
      include: { package: true },
    })

    res.json({ success: true, data: { id: updated.id, username: updated.username } })
  } catch (err) {
    next(err)
  }
})

// PATCH /admin/users/:id/status
usersRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['ACTIVE', 'PASSIVE', 'SUSPENDED', 'TRIAL']),
    })
    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz durum değeri.')

    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) throw new AppError(404, 'Kullanıcı bulunamadı.')

    await prisma.user.update({
      where: { id: req.params.id },
      data: { status: body.data.status },
    })

    res.json({ success: true, message: 'Durum güncellendi.' })
  } catch (err) {
    next(err)
  }
})

// DELETE /admin/users/:id
usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) throw new AppError(404, 'Kullanıcı bulunamadı.')
    if (user.role === 'SUPER_ADMIN') throw new AppError(403, 'Süper admin silinemez.')

    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Kullanıcı silindi.' })
  } catch (err) {
    next(err)
  }
})

// POST /admin/users/:id/reset-password
usersRouter.post('/:id/reset-password', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!user) throw new AppError(404, 'Kullanıcı bulunamadı.')

    const tempPassword = Math.random().toString(36).slice(-8) + 'B2@'
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash, passwordChanged: false },
    })

    res.json({
      success: true,
      data: { tempPassword },
      message: 'Şifre sıfırlandı.',
    })
  } catch (err) {
    next(err)
  }
})
