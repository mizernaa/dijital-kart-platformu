import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const pricingRouter = Router()

// GET /admin/pricing — tüm planları listele
pricingRouter.get('/', async (req, res, next) => {
  try {
    const plans = await prisma.pricingPlan.findMany({ orderBy: { sortOrder: 'asc' } })
    const parsed = plans.map(p => ({
      ...p,
      features: (() => { try { return JSON.parse(p.features) } catch { return [] } })(),
    }))
    res.json({ success: true, data: parsed })
  } catch (err) { next(err) }
})

// PUT /admin/pricing/:id — plan güncelle
pricingRouter.put('/:id', async (req, res, next) => {
  try {
    const schema = z.object({
      displayName: z.string().min(1).max(100).optional(),
      tagline: z.string().max(300).optional(),
      price: z.number().int().min(0).nullable().optional(),
      priceLabel: z.string().max(50).nullable().optional(),
      currency: z.string().max(5).optional(),
      period: z.string().max(50).optional(),
      featured: z.boolean().optional(),
      features: z.array(z.string()).optional(),
      ctaText: z.string().max(100).optional(),
      sortOrder: z.number().int().optional(),
      isActive: z.boolean().optional(),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz veri.', body.error.errors)

    const existing = await prisma.pricingPlan.findUnique({ where: { id: req.params.id } })
    if (!existing) throw new AppError(404, 'Plan bulunamadı.')

    const updateData: any = { ...body.data }
    if (body.data.features !== undefined) {
      updateData.features = JSON.stringify(body.data.features)
    }

    const plan = await prisma.pricingPlan.update({
      where: { id: req.params.id },
      data: updateData,
    })

    res.json({ success: true, data: plan })
  } catch (err) { next(err) }
})
