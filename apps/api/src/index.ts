import 'dotenv/config'
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
import { healthRouter } from './routes/health'
import { errorHandler } from './middleware/errorHandler'
import { scheduleWeeklyReport } from './jobs/weeklyReport'

const app = express()
const PORT = process.env.API_PORT || 3001

// CORS origin listesi — production + development fallback
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.PUBLIC_SITE_URL,
].filter(Boolean) as string[]

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3002')
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}))
app.use(compression())
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
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
app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/admin', adminRouter)
app.use('/customer', customerRouter)
app.use('/p', publicRouter)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`API sunucu çalışıyor: http://localhost:${PORT}`)
  scheduleWeeklyReport()
})

export default app
