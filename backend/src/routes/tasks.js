import { Router } from 'express'
import { getTasks, toggleTask, generateTasks, getProgress } from '../controllers/taskController.js'

const router = Router()

router.get('/', getTasks)
router.post('/toggle', toggleTask)
router.post('/generate', generateTasks)
router.get('/progress', getProgress)

export default router
