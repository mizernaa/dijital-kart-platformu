import { Router } from 'express'
import { verifyToken, requireRole } from '../../middleware/auth'
import { profileRouter } from './profile'
import { qrRouter } from './qr'
import { analyticsRouter } from './analytics'
import { leadsRouter } from './leads'
import { nfcRouter } from './nfc'

export const customerRouter = Router()

customerRouter.use(verifyToken)
customerRouter.use(requireRole(['CUSTOMER']))

customerRouter.use('/profile', profileRouter)
customerRouter.use('/qr', qrRouter)
customerRouter.use('/analytics', analyticsRouter)
customerRouter.use('/leads', leadsRouter)
customerRouter.use('/nfc', nfcRouter)
