import { Router } from 'express'
import { createChatReply } from '../controllers/chatController.js'

const router = Router()

router.post('/', createChatReply)

export default router
