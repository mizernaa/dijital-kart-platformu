import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const packagesRouter = Router()

// GET /admin/packages
packagesRouter.get('/', async (_req, res, next) => {
  try {
    const packages = await prisma.package.findMany({ orderBy: { name: 'asc' } })
    res.json({ success: true, data: packages })
  } catch (err) {
    next(err)
  }
})

// GET /admin/packages/:id
packagesRouter.get('/:id', async (req, res, next) => {
  try {
    const pkg = await prisma.package.findUnique({ where: { id: req.params.id } })
    if (!pkg) throw new AppError(404, 'Paket bulunamadı.')
    res.json({ success: true, data: pkg })
  } catch (err) {
    next(err)
  }
})

// PUT /admin/packages/:id — paket özelliklerini güncelle
packagesRouter.put('/:id', async (req, res, next) => {
  try {
    const schema = z.object({
      displayName: z.string().min(1).optional(),
      maxPages: z.number().int().positive().optional(),
      analyticsRetentionDays: z.number().int().positive().optional(),
      hasCustomDomain: z.boolean().optional(),
      hasNfc: z.boolean().optional(),
      maxThemes: z.number().int().positive().optional(),
      maxTeamMembers: z.number().int().positive().optional(),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz giriş.')

    const pkg = await prisma.package.findUnique({ where: { id: req.params.id } })
    if (!pkg) throw new AppError(404, 'Paket bulunamadı.')

    const updated = await prisma.package.update({
      where: { id: req.params.id },
      data: body.data,
    })

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})
