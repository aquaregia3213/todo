import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

import { connectDB } from './config/db.js'
import { requestId } from './middleware/requestId.js'
import { authMiddleware } from './middleware/authMiddleware.js'
import { errorHandler } from './middleware/errorHandler.js'

import healthRoutes  from './routes/health.js'
import chatRoutes    from './routes/chat.js'
import profileRoutes from './routes/profile.js'
import roadmapRoutes from './routes/roadmap.js'
import taskRoutes    from './routes/tasks.js'
import resumeRoutes  from './routes/resume.js'

// Connect to MongoDB only if MONGODB_URI is set and no Supabase configured
if (!process.env.SUPABASE_URL) connectDB()

const app = express()

// ── Security ─────────────────────────────────────────────────────────────────

app.use(helmet())

const allowedOrigin = process.env.FRONTEND_URL
app.use(cors({
  origin: allowedOrigin || false,   // 'false' blocks all cross-origin in production
  credentials: true,
}))

// ── Body parsing (with size limits) ──────────────────────────────────────────

app.use(express.json({ limit: '256kb' }))
app.use(express.urlencoded({ extended: true, limit: '256kb' }))

// ── Request ID ───────────────────────────────────────────────────────────────

app.use(requestId)

// ── Rate limiting ─────────────────────────────────────────────────────────────

/** Default limiter — generous, applied to all routes */
const defaultLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please slow down.' },
})

/** Tight limiter for AI-powered routes */
const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'AI rate limit reached. Please wait a moment.' },
})

/** Very tight limiter for expensive generation endpoints */
const genLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Generation rate limit reached. Please wait before generating again.' },
})

app.use(defaultLimiter)

// ── Auth (sets req.userId on every request) ───────────────────────────────────

app.use(authMiddleware)

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/health',   healthRoutes)
app.use('/api/profile',  profileRoutes)
app.use('/api/tasks',    taskRoutes)
app.use('/api/chat',     aiLimiter,  chatRoutes)
app.use('/api/resume',   aiLimiter,  resumeRoutes)
app.use('/api/roadmap',  roadmapRoutes)   // /generate gets genLimiter inside the route

// ── Error handler ─────────────────────────────────────────────────────────────

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`[server] Running on port ${PORT}`))
