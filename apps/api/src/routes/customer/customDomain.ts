import { Router } from 'express'
import { promises as dns } from 'dns'
import crypto from 'crypto'
import { prisma } from '@dkp/database'
import { AppError } from '../../middleware/errorHandler'

export const customDomainRouter = Router()

const DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || 'qkart.io'

// GET /customer/custom-domain
customDomainRouter.get('/', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
      select: { customDomain: true, customDomainVerified: true, customDomainToken: true },
    })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')

    res.json({
      success: true,
      data: {
        domain: profile.customDomain,
        verified: profile.customDomainVerified,
        token: profile.customDomainToken,
        cnameTarget: PLATFORM_DOMAIN,
      },
    })
  } catch (err) {
    next(err)
  }
})

// POST /customer/custom-domain
customDomainRouter.post('/', async (req, res, next) => {
  try {
    const { domain } = req.body as { domain: string }
    if (!domain || !DOMAIN_REGEX.test(domain)) {
      throw new AppError(400, 'Geçersiz domain formatı.')
    }

    // Check no other profile uses it
    const existing = await prisma.profile.findUnique({ where: { customDomain: domain } })
    const myProfile = await prisma.profile.findUnique({ where: { userId: req.user!.userId }, select: { id: true } })
    if (!myProfile) throw new AppError(404, 'Profil bulunamadı.')

    if (existing && existing.id !== myProfile.id) {
      throw new AppError(409, 'Bu domain zaten başka bir profil tarafından kullanılıyor.')
    }

    const token = crypto.randomBytes(16).toString('hex')

    await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: { customDomain: domain, customDomainVerified: false, customDomainToken: token },
    })

    res.json({
      success: true,
      data: { domain, verified: false, token, cnameTarget: PLATFORM_DOMAIN },
      message: 'Domain kaydedildi. DNS doğrulaması için TXT kaydını ekleyin.',
    })
  } catch (err) {
    next(err)
  }
})

// POST /customer/custom-domain/verify
customDomainRouter.post('/verify', async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.userId },
      select: { customDomain: true, customDomainToken: true },
    })
    if (!profile) throw new AppError(404, 'Profil bulunamadı.')
    if (!profile.customDomain || !profile.customDomainToken) {
      throw new AppError(400, 'Önce bir domain kaydedin.')
    }

    let txtRecords: string[][] = []
    try {
      txtRecords = await dns.resolveTxt(profile.customDomain)
    } catch {
      throw new AppError(400, 'DNS sorgusu başarısız. TXT kaydını ekledinizden emin olun.')
    }

    const expectedValue = `qkrt-verify=${profile.customDomainToken}`
    const found = txtRecords.flat().some(r => r === expectedValue)

    if (!found) {
      throw new AppError(400, `TXT kaydı bulunamadı. Beklenen değer: ${expectedValue}`)
    }

    await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: { customDomainVerified: true },
    })

    res.json({ success: true, message: 'Domain başarıyla doğrulandı!' })
  } catch (err) {
    next(err)
  }
})

// DELETE /customer/custom-domain
customDomainRouter.delete('/', async (req, res, next) => {
  try {
    await prisma.profile.update({
      where: { userId: req.user!.userId },
      data: { customDomain: null, customDomainVerified: false, customDomainToken: null },
    })
    res.json({ success: true, message: 'Özel domain kaldırıldı.' })
  } catch (err) {
    next(err)
  }
})
