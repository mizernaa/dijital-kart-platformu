import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { rateLimit } from 'express-rate-limit'
import path from 'path'

import { authRouter } from './routes/auth'
import { adminRouter } from './routes/admin'
import { customerRouter } from './routes/customer'
import { publicRouter } from './routes/public'
import { errorHandler } from './middleware/errorHandler'
import { scheduleWeeklyReport } from './jobs/weeklyReport'

const app = express()
const PORT = process.env.API_PORT || 3001

app.use(helmet())
app.use(compression())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.PUBLIC_SITE_URL || 'http://localhost:3002',
  ],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Statik dosyalar (upload edilen görseller)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Genel rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(generalLimiter)

// Routes
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/customer', customerRouter)
app.use('/p', publicRouter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`API sunucu çalışıyor: http://localhost:${PORT}`)
  scheduleWeeklyReport()
})

export default app
