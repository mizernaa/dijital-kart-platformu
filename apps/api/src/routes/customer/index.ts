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

export const customerRouter = Router()

customerRouter.use(verifyToken)
customerRouter.use(requireRole(['CUSTOMER']))
customerRouter.use(attachUserPackage)

customerRouter.use('/profile', profileRouter)
customerRouter.use('/qr', qrRouter)
customerRouter.use('/analytics', clampAnalyticsDays, analyticsRouter)
customerRouter.use('/leads', leadsRouter)
customerRouter.use('/nfc', requirePackageFeature('hasNfc', 'NFC özelliği paketinizde mevcut değil. STARTER veya üstüne geçin.'), nfcRouter)
customerRouter.use('/custom-domain', requirePackageFeature('hasCustomDomain', 'Özel domain özelliği PRO veya ENTERPRISE pakette mevcuttur.'), customDomainRouter)
customerRouter.use('/team', teamRouter)
