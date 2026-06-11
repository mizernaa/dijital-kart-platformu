import { Router } from 'express'
import { z } from 'zod'
import multer from 'multer'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'
import { processAndSaveImage } from '../../utils/imageProcessor'

export const profileRouter = Router()

// Sadece bilinen görsel tipleri kabul edilir; hepsi yüklenince WebP'e
// çevrilip orantılı küçültülür (bkz. utils/imageProcessor).
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

// Dosya RAM'de tutulur, sharp ile işlenip diske yazılır.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Sadece JPEG, PNG, WebP veya GIF yüklenebilir.'))
    }
    cb(null, true)
  },
})

// GET /customer/profile
profileRouter.get('/', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
      include: {
        contacts: { orderBy: { order: 'asc' } },
        socials: { orderBy: { order: 'asc' } },
        qrCode: true,
      },
    })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')
    res.json({ success: true, data: profile })
  } catch (err) {
    next(err)
  }
})

// PUT /customer/profile
profileRouter.put('/', async (req, res, next) => {
  try {
    const schema = z.object({
      displayName: z.string().min(1).max(100).optional(),
      title: z.string().max(100).optional(),
      bio: z.string().max(500).optional(),
      theme: z.string().optional(),
      bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
      accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
      fontFamily: z.string().optional(),
      buttonStyle: z.enum(['ROUNDED', 'SQUARE', 'PILL']).optional(),
      profileShape: z.enum(['CIRCLE', 'SQUARE', 'HEXAGON']).optional(),
      isPublished: z.boolean().optional(),
      // Şirket bölümü
      companyName: z.string().max(100).optional().nullable(),
      companyDescription: z.string().max(500).optional().nullable(),
      companyWebsite: z.string().max(200).optional().nullable(),
      companyIndustry: z.string().max(100).optional().nullable(),
      showCompanySection: z.boolean().optional(),
      // CV bölümü
      cvSkills: z.string().optional().nullable(),
      cvLanguages: z.string().optional().nullable(),
      showCvSection: z.boolean().optional(),
      // Genişletilmiş profil
      location: z.string().max(100).optional().nullable(),
      tagline: z.string().max(160).optional().nullable(),
      available: z.boolean().optional(),
      calendarUrl: z.string().url().optional().nullable(),
      stats: z.string().optional().nullable(),
      services: z.string().optional().nullable(),
      projects: z.string().optional().nullable(),
      testimonials: z.string().optional().nullable(),
      experience: z.string().optional().nullable(),
      education: z.string().optional().nullable(),
      showStatsSection: z.boolean().optional(),
      showServicesSection: z.boolean().optional(),
      showProjectsSection: z.boolean().optional(),
      showTestimonialsSection: z.boolean().optional(),
      showCareerSection: z.boolean().optional(),
      showContactForm: z.boolean().optional(),
      showQrSection: z.boolean().optional(),
      cardStyle: z.enum(['premium', 'minimal', 'glass']).optional(),
      typographyDensity: z.enum(['compact', 'standard', 'spacious']).optional(),
      // Public mod + sosyal içerik
      profileMode: z.enum(['BUSINESS', 'SOCIAL']).optional(),
      tickerText: z.string().max(300).optional().nullable(),
      socialData: z.string().max(120000).optional().nullable()
        .refine(v => v == null || (() => { try { JSON.parse(v); return true } catch { return false } })(), 'Geçersiz sosyal veri.'),
    })

    const body = schema.safeParse(req.body)
    if (!body.success) {
      const errors = Object.fromEntries(body.error.errors.map(e => [e.path.join('.'), e.message]))
      throw new AppError(400, 'Geçersiz giriş.', errors)
    }

    const profile = await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: body.data,
    })

    res.json({ success: true, data: profile })
  } catch (err) {
    next(err)
  }
})

// POST /customer/profile/avatar
profileRouter.post('/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'Resim dosyası gerekli.')

    const filename = await processAndSaveImage(req.file.buffer, req.file.mimetype, 'avatar')
    const avatarUrl = `/uploads/${filename}`

    await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: { avatarUrl },
    })

    res.json({ success: true, data: { avatarUrl } })
  } catch (err) {
    next(err)
  }
})

// POST /customer/profile/image — genel görsel yükleme (galeri, kapak, post, wallpaper)
profileRouter.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'Resim dosyası gerekli.')
    const filename = await processAndSaveImage(req.file.buffer, req.file.mimetype, 'general')
    const url = `/uploads/${filename}`
    res.json({ success: true, data: { url } })
  } catch (err) {
    next(err)
  }
})

// POST /customer/profile/company-logo
profileRouter.post('/company-logo', upload.single('logo'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'Resim dosyası gerekli.')
    const filename = await processAndSaveImage(req.file.buffer, req.file.mimetype, 'logo')
    const companyLogoUrl = `/uploads/${filename}`
    await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: { companyLogoUrl },
    })
    res.json({ success: true, data: { companyLogoUrl } })
  } catch (err) {
    next(err)
  }
})

// --- Contacts ---

// GET /customer/profile/contacts
profileRouter.get('/contacts', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const contacts = await prisma.contactItem.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' },
    })
    res.json({ success: true, data: contacts })
  } catch (err) {
    next(err)
  }
})

const contactSchema = z.object({
  type: z.enum(['PHONE', 'EMAIL', 'WHATSAPP', 'TELEGRAM', 'WEBSITE', 'CUSTOM']),
  value: z.string().min(1),
  label: z.string().optional(),
  order: z.number().int().default(0),
})

// POST /customer/profile/contacts
profileRouter.post('/contacts', async (req, res, next) => {
  try {
    const body = contactSchema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz giriş.')

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const contact = await prisma.contactItem.create({
      data: { ...body.data, profileId: profile.id },
    })
    res.status(201).json({ success: true, data: contact })
  } catch (err) {
    next(err)
  }
})

// PUT /customer/profile/contacts/:id
profileRouter.put('/contacts/:id', async (req, res, next) => {
  try {
    const body = contactSchema.partial().safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz giriş.')

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const contact = await prisma.contactItem.findFirst({
      where: { id: req.params.id, profileId: profile.id },
    })
    if (!contact) throw new AppError(404, 'Kontakt bulunamadı.')

    const updated = await prisma.contactItem.update({
      where: { id: req.params.id },
      data: body.data,
    })
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})

// DELETE /customer/profile/contacts/:id
profileRouter.delete('/contacts/:id', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const contact = await prisma.contactItem.findFirst({
      where: { id: req.params.id, profileId: profile.id },
    })
    if (!contact) throw new AppError(404, 'Kontakt bulunamadı.')

    await prisma.contactItem.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Silindi.' })
  } catch (err) {
    next(err)
  }
})

// --- Socials ---

const socialSchema = z.object({
  platform: z.enum([
    'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'TIKTOK', 'FACEBOOK',
    'GITHUB', 'BEHANCE', 'DRIBBBLE', 'SPOTIFY', 'SOUNDCLOUD', 'CUSTOM',
  ]),
  url: z.string().url(),
  order: z.number().int().default(0),
})

// GET /customer/profile/socials
profileRouter.get('/socials', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const socials = await prisma.socialLink.findMany({
      where: { profileId: profile.id },
      orderBy: { order: 'asc' },
    })
    res.json({ success: true, data: socials })
  } catch (err) {
    next(err)
  }
})

// POST /customer/profile/socials
profileRouter.post('/socials', async (req, res, next) => {
  try {
    const body = socialSchema.safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz giriş.')

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const social = await prisma.socialLink.create({
      data: { ...body.data, profileId: profile.id },
    })
    res.status(201).json({ success: true, data: social })
  } catch (err) {
    next(err)
  }
})

// PUT /customer/profile/socials/:id
profileRouter.put('/socials/:id', async (req, res, next) => {
  try {
    const body = socialSchema.partial().safeParse(req.body)
    if (!body.success) throw new AppError(400, 'Geçersiz giriş.')

    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const social = await prisma.socialLink.findFirst({
      where: { id: req.params.id, profileId: profile.id },
    })
    if (!social) throw new AppError(404, 'Sosyal link bulunamadı.')

    const updated = await prisma.socialLink.update({ where: { id: req.params.id }, data: body.data })
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
})

// DELETE /customer/profile/socials/:id
profileRouter.delete('/socials/:id', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.user!.userId } })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    const social = await prisma.socialLink.findFirst({
      where: { id: req.params.id, profileId: profile.id },
    })
    if (!social) throw new AppError(404, 'Sosyal link bulunamadı.')

    await prisma.socialLink.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Silindi.' })
  } catch (err) {
    next(err)
  }
})
