import { Router } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import { UAParser } from 'ua-parser-js'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'
import { generateVCard } from '../../utils/vcard'
import { ProfileDetail } from '@dkp/types'

export const publicRouter = Router()

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
      source: z.string().optional(),
      buttonLabel: z.string().optional(),
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

// POST /p/:slug/lead — lead capture formu
publicRouter.post('/:slug/lead', async (req, res, next) => {
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

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder') {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@dijitalkart.com',
        to: profile.user.email,
        subject: `Yeni mesaj: ${body.data.name}`,
        html: `<p><strong>${body.data.name}</strong> size bir mesaj gönderdi.</p>
               ${body.data.email ? `<p>E-posta: ${body.data.email}</p>` : ''}
               <p style="white-space:pre-wrap">${body.data.message}</p>`,
      }).catch(() => {})
    }

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
