import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { getRoadmap, generateRoadmap } from '../controllers/roadmapController.js'

const router = Router()

/** 5 generations per minute — expensive AI call */
const genLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Generation rate limit reached. Please wait before generating again.' },
})

router.get('/', getRoadmap)
router.post('/generate', genLimiter, generateRoadmap)

export default router
