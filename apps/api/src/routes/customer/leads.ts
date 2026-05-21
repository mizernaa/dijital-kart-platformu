import { Router } from 'express'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const leadsRouter = Router()

// GET /customer/leads?page=1&limit=20&unreadOnly=true
leadsRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20)
    const unreadOnly = req.query.unreadOnly === 'true'
    const skip = (page - 1) * limit

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const where = {
      profileId: profile.id,
      ...(unreadOnly ? { isRead: false } : {}),
    }

    const [leads, total, unreadCount] = await Promise.all([
      prisma.leadCapture.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.leadCapture.count({ where }),
      prisma.leadCapture.count({ where: { profileId: profile.id, isRead: false } }),
    ])

    res.json({
      success: true,
      data: leads,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), unreadCount },
    })
  } catch (err) {
    next(err)
  }
})

// GET /customer/leads/export — CSV indir
leadsRouter.get('/export', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const leads = await prisma.leadCapture.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    })

    const header = 'Ad Soyad,E-posta,Mesaj,Tarih,Okundu\n'
    const rows = leads.map(l => [
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${l.createdAt.toISOString()}"`,
      l.isRead ? 'Evet' : 'Hayır',
    ].join(',')).join('\n')

    const csv = '﻿' + header + rows

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"')
    res.send(csv)
  } catch (err) {
    next(err)
  }
})

// PATCH /customer/leads/read-all — tümünü okundu işaretle
leadsRouter.patch('/read-all', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const { count } = await prisma.leadCapture.updateMany({
      where: { profileId: profile.id, isRead: false },
      data: { isRead: true },
    })

    res.json({ success: true, data: { updated: count } })
  } catch (err) {
    next(err)
  }
})

// PATCH /customer/leads/:id/read — tek lead okundu
leadsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const lead = await prisma.leadCapture.findFirst({
      where: { id: req.params.id, profileId: profile.id },
    })
    if (!lead) throw new AppError(404, 'Lead bulunamadı.')

    await prisma.leadCapture.update({ where: { id: lead.id }, data: { isRead: true } })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})
