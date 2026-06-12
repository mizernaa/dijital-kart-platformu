import { Router } from 'express'
import { verifyToken, requireRole } from '../../middleware/auth'
import { attachUserPackage, requirePackageFeature, clampAnalyticsDays } from '../../middleware/packageLimits'
import { profileRouter } from './profile'
import { qrRouter } from './qr'
import { analyticsRouter } from './analytics'
import { leadsRouter } from './leads'
import { nfcRouter } from './nfc'
import { customDomainRouter } from './customDomain'
import { teamRouter } from './team'
import { notificationsRouter } from './notifications'
import { devicesRouter } from './devices'

export const customerRouter = Router()

customerRouter.use(verifyToken)
customerRouter.use(requireRole(['CUSTOMER']))
customerRouter.use(attachUserPackage)

// GET /customer/package — kullanıcının mevcut paketi + karşılaştırma için tüm paketler
customerRouter.get('/package', async (req, res, next) => {
  try {
    const { prisma } = await import('@dkp/database')
    const order = { FREE: 0, STARTER: 1, PRO: 2, ENTERPRISE: 3 } as Record<string, number>
    const all = (await prisma.package.findMany()).sort((a, b) => (order[a.name] ?? 9) - (order[b.name] ?? 9))
    res.json({ success: true, data: { current: req.userPackage ?? null, all } })
  } catch (err) {
    next(err)
  }
})

customerRouter.use('/profile', profileRouter)
customerRouter.use('/qr', qrRouter)
customerRouter.use('/analytics', clampAnalyticsDays, analyticsRouter)
customerRouter.use('/leads', leadsRouter)
// NFC kart siparişi bir satın alma akışıdır — tüm müşterilere açık (paket kilidi yok).
customerRouter.use('/nfc', nfcRouter)
customerRouter.use('/custom-domain', requirePackageFeature('hasCustomDomain', 'Özel domain özelliği PRO veya ENTERPRISE pakette mevcuttur.'), customDomainRouter)
customerRouter.use('/team', teamRouter)
customerRouter.use('/notifications', notificationsRouter)
customerRouter.use('/devices', devicesRouter)
