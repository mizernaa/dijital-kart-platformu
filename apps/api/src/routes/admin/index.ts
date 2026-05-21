import { Router } from 'express'
import { verifyToken, requireRole } from '../../middleware/auth'
import { usersRouter } from './users'
import { packagesRouter } from './packages'
import { nfcOrdersRouter } from './nfc-orders'
import { statsRouter } from './stats'
import { platformAnalyticsRouter } from './platform-analytics'

export const adminRouter = Router()

adminRouter.use(verifyToken)
adminRouter.use(requireRole(['SUPER_ADMIN', 'SUPPORT']))

adminRouter.use('/users', usersRouter)
adminRouter.use('/packages', packagesRouter)
adminRouter.use('/nfc-orders', nfcOrdersRouter)
adminRouter.use('/stats', statsRouter)
adminRouter.use('/analytics', platformAnalyticsRouter)
