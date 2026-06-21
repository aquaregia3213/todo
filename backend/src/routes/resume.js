import { Router } from 'express'
import multer from 'multer'
import { analyzeResume } from '../controllers/resumeController.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

const router = Router()

router.post('/analyze', upload.single('resume'), analyzeResume)

export default router
