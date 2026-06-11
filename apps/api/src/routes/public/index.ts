import { Router } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import { rateLimit } from 'express-rate-limit'
import { UAParser } from 'ua-parser-js'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'
import { generateVCard } from '../../utils/vcard'
import { sendEmail, escapeHtml } from '../../utils/email'
import { ProfileDetail } from '@dkp/types'

export const publicRouter = Router()

// Form spam'ine karşı sıkı limit (genel limiter 200/15dk'dan ayrı)
const orderLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false })
const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false })

// GET /p/plans — landing page fiyatlandırma planları (public)
publicRouter.get('/plans', async (req, res, next) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    // features alanını JSON'a parse et
    const parsed = plans.map(p => ({
      ...p,
      features: (() => { try { return JSON.parse(p.features) } catch { return [] } })(),
    }))
    res.json({ success: true, data: parsed })
  } catch (err) { next(err) }
})

// POST /p/order — landing page sipariş formu
publicRouter.post('/order', orderLimiter, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      phone: z.string().min(1).max(20),
      email: z.string().email(),
      plan: z.enum(['KLASIK', 'METAL', 'KURUMSAL']),
      note: z.string().max(500).optional(),
    })
    const body = schema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz form verisi.')

    const order = await prisma.order.create({ data: body.data })

    // Admin'e bildirim oluştur (tüm SUPER_ADMIN ve SUPPORT kullanıcılarına)
    const admins = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'SUPPORT'] } },
      select: { id: true, email: true },
    })
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          type: 'NEW_ORDER',
          message: `Yeni sipariş: ${body.data.name} — ${body.data.plan} (${body.data.phone})`,
        })),
      })

      // Admin'lere e-posta bildirimi (RESEND ayarlı değilse sessizce atlanır)
      const adminEmails = admins.map(a => a.email).filter(Boolean) as string[]
      if (adminEmails.length > 0) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        sendEmail({
          to: adminEmails,
          subject: `🛒 Yeni sipariş: ${body.data.name} — ${body.data.plan}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
              <h2 style="color:#1e293b">Yeni sipariş alındı</h2>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#f8fafc"><td style="padding:10px 14px;color:#64748b">Ad Soyad</td><td style="padding:10px 14px;font-weight:600;color:#1e293b">${escapeHtml(body.data.name)}</td></tr>
                <tr><td style="padding:10px 14px;color:#64748b">Telefon</td><td style="padding:10px 14px;font-weight:600;color:#1e293b">${escapeHtml(body.data.phone)}</td></tr>
                <tr style="background:#f8fafc"><td style="padding:10px 14px;color:#64748b">E-posta</td><td style="padding:10px 14px;font-weight:600;color:#1e293b">${escapeHtml(body.data.email)}</td></tr>
                <tr><td style="padding:10px 14px;color:#64748b">Paket</td><td style="padding:10px 14px;font-weight:600;color:#1e293b">${escapeHtml(body.data.plan)}</td></tr>
                ${body.data.note ? `<tr style="background:#f8fafc"><td style="padding:10px 14px;color:#64748b">Not</td><td style="padding:10px 14px;color:#1e293b;white-space:pre-wrap">${escapeHtml(body.data.note)}</td></tr>` : ''}
              </table>
              <a href="${frontendUrl}/admin/orders" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Siparişleri Görüntüle</a>
            </div>
          `,
        })
      }
    }

    res.status(201).json({ success: true, data: { id: order.id } })
  } catch (err) { next(err) }
})

// GET /p/domain/:domain — custom domain lookup (auth yok)
publicRouter.get('/domain/:domain', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findFirst({
      where: {
        customDomain: req.params.domain,
        customDomainVerified: true,
        isPublished: true,
      },
      select: { slug: true },
    })
    if (!profile) throw new AppError(404, 'Domain bulunamadı.')
    res.json({ success: true, data: { slug: profile.slug } })
  } catch (err) {
    next(err)
  }
})

// GET /p/:slug — public profil verisi
publicRouter.get('/:slug', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { slug: req.params.slug },
      include: {
        contacts: { orderBy: { order: 'asc' } },
        socials: { orderBy: { order: 'asc' } },
      },
    })

    if (!profile || !profile.isPublished) {
      throw new AppError(404, 'Profil bulunamadı.')
    }

    res.json({ success: true, data: profile })
  } catch (err) {
    next(err)
  }
})

// POST /p/:slug/event — analitik event kaydet
publicRouter.post('/:slug/event', async (req, res, next) => {
  try {
    const schema = z.object({
      eventType: z.enum(['PAGE_VIEW', 'BUTTON_CLICK', 'QR_SCAN', 'NFC_SCAN', 'VCARD_DOWNLOAD', 'CONTACT_FORM']),
      source: z.string().max(50).optional(),
      buttonLabel: z.string().max(100).optional(),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) {
      res.json({ success: false })
      return
    }

    const profile = await prisma.profile.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, isPublished: true },
    })

    if (!profile || !profile.isPublished) {
      res.json({ success: false })
      return
    }

    // IP'yi hash'le (KVKK uyumu)
    const ip = req.ip || req.socket.remoteAddress || ''
    const ipHash = crypto.createHash('sha256').update(ip + 'dkp-salt').digest('hex').slice(0, 16)

    // User-agent parse
    const ua = new UAParser(req.headers['user-agent'])
    const device = ua.getDevice().type || 'desktop'
    const browser = ua.getBrowser().name || 'unknown'

    await prisma.analyticsEvent.create({
      data: {
        profileId: profile.id,
        eventType: body.data.eventType,
        source: body.data.source,
        buttonLabel: body.data.buttonLabel,
        ipHash,
        device,
        browser,
      },
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// GET /p/:slug/reactions — sosyal sayfa tepki (🔥) sayacı
publicRouter.get('/:slug/reactions', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { slug: req.params.slug },
      select: { id: true, isPublished: true },
    })
    if (!profile || !profile.isPublished) {
      res.json({ success: true, data: { count: 0 } })
      return
    }
    const count = await prisma.analyticsEvent.count({
      where: { profileId: profile.id, eventType: 'BUTTON_CLICK', buttonLabel: 'reaction' },
    })
    res.json({ success: true, data: { count } })
  } catch (err) { next(err) }
})

// POST /p/:slug/lead — lead capture formu
publicRouter.post('/:slug/lead', leadLimiter, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().optional().or(z.literal('')),
      message: z.string().min(1).max(500),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) {
      throw new AppError(400, 'Geçersiz form verisi.', body.error.errors)
    }

    const profile = await prisma.profile.findUnique({
      where: { slug: req.params.slug },
      include: { user: { select: { email: true } } },
    })

    if (!profile || !profile.isPublished) {
      throw new AppError(404, 'Profil bulunamadı.')
    }

    const lead = await prisma.leadCapture.create({
      data: {
        profileId: profile.id,
        name: body.data.name,
        email: body.data.email || null,
        message: body.data.message,
      },
    })

    prisma.analyticsEvent.create({
      data: { profileId: profile.id, eventType: 'CONTACT_FORM' },
    }).catch(() => {})

    sendEmail({
      to: profile.user.email,
      subject: `Yeni mesaj: ${body.data.name}`,
      html: `<p><strong>${escapeHtml(body.data.name)}</strong> size bir mesaj gönderdi.</p>
             ${body.data.email ? `<p>E-posta: ${escapeHtml(body.data.email)}</p>` : ''}
             <p style="white-space:pre-wrap">${escapeHtml(body.data.message)}</p>`,
    })

    res.json({ success: true, data: { id: lead.id } })
  } catch (err) {
    next(err)
  }
})

// GET /p/:slug/vcard — vCard (.vcf) dosyası indir
publicRouter.get('/:slug/vcard', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { slug: req.params.slug },
      include: {
        contacts: { orderBy: { order: 'asc' } },
        socials: { orderBy: { order: 'asc' } },
      },
    })

    if (!profile || !profile.isPublished) {
      throw new AppError(404, 'Profil bulunamadı.')
    }

    const profileData = {
      id: profile.id,
      slug: profile.slug,
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      theme: profile.theme,
      bgColor: profile.bgColor,
      accentColor: (profile as any).accentColor ?? null,
      profileMode: (profile as any).profileMode ?? 'BUSINESS',
      socialData: (profile as any).socialData ?? null,
      tickerText: (profile as any).tickerText ?? null,
      fontFamily: profile.fontFamily,
      buttonStyle: profile.buttonStyle as ProfileDetail['buttonStyle'],
      profileShape: profile.profileShape as ProfileDetail['profileShape'],
      isPublished: profile.isPublished,
      companyName: (profile as any).companyName ?? null,
      companyLogoUrl: (profile as any).companyLogoUrl ?? null,
      companyDescription: (profile as any).companyDescription ?? null,
      companyWebsite: (profile as any).companyWebsite ?? null,
      companyIndustry: (profile as any).companyIndustry ?? null,
      showCompanySection: (profile as any).showCompanySection ?? false,
      cvSkills: (profile as any).cvSkills ?? null,
      cvLanguages: (profile as any).cvLanguages ?? null,
      showCvSection: (profile as any).showCvSection ?? false,
      contacts: profile.contacts.map((c: any) => ({
        id: c.id,
        type: c.type as ProfileDetail['contacts'][0]['type'],
        value: c.value,
        label: c.label,
        order: c.order,
      })),
      socials: profile.socials.map((s: any) => ({
        id: s.id,
        platform: s.platform as ProfileDetail['socials'][0]['platform'],
        url: s.url,
        order: s.order,
      })),
    } as unknown as ProfileDetail

    const vcardContent = generateVCard(profileData)

    // Analitik event kaydet
    prisma.analyticsEvent.create({
      data: { profileId: profile.id, eventType: 'VCARD_DOWNLOAD' },
    }).catch(() => {})

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${profile.slug}.vcf"`)
    res.send(vcardContent)
  } catch (err) {
    next(err)
  }
})
