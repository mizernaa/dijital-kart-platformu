import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'
import { generateQRPng, generateQRSvg, generateQRDataUrl } from '../../utils/qrcode'

export const qrRouter = Router()

const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:3002'

// GET /customer/qr — mevcut QR ayarları ve data URL
qrRouter.get('/', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
      include: { qrCode: true },
    })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const profileUrl = `${PUBLIC_SITE_URL}/u/${profile.slug}`
    const config = profile.qrCode || {
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      logoUrl: null,
    }

    const dataUrl = await generateQRDataUrl({
      url: profileUrl,
      foregroundColor: config.foregroundColor,
      backgroundColor: config.backgroundColor,
    })

    res.json({
      success: true,
      data: {
        config,
        profileUrl,
        dataUrl,
      },
    })
  } catch (err) {
    next(err)
  }
})

// POST /customer/qr — QR ayarlarını kaydet
qrRouter.post('/', async (req, res, next) => {
  try {
    const schema = z.object({
      foregroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#000000'),
      backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ffffff'),
      format: z.enum(['PNG', 'SVG', 'PDF']).default('PNG'),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz renk değeri.')

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const qrCode = await prisma.qRCode.upsert({
      where: { profileId: profile.id },
      create: { profileId: profile.id, ...body.data },
      update: body.data,
    })

    res.json({ success: true, data: qrCode })
  } catch (err) {
    next(err)
  }
})

// GET /customer/qr/download?format=png|svg&size=512
qrRouter.get('/download', async (req, res, next) => {
  try {
    const format = (req.query.format as string || 'png').toLowerCase()
    const size = parseInt(req.query.size as string) || 512

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
      include: { qrCode: true },
    })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const profileUrl = `${PUBLIC_SITE_URL}/u/${profile.slug}`
    const fg = profile.qrCode?.foregroundColor || '#000000'
    const bg = profile.qrCode?.backgroundColor || '#ffffff'

    if (format === 'svg') {
      const svg = await generateQRSvg({ url: profileUrl, foregroundColor: fg, backgroundColor: bg })
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Content-Disposition', `attachment; filename="qr-${profile.slug}.svg"`)
      res.send(svg)
    } else {
      const buffer = await generateQRPng({ url: profileUrl, foregroundColor: fg, backgroundColor: bg, size })
      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', `attachment; filename="qr-${profile.slug}.png"`)
      res.send(buffer)
    }
  } catch (err) {
    next(err)
  }
})
