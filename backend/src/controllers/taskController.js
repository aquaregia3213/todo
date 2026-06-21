import { dbStore } from '../config/store.js'

export async function getTasks(req, res, next) {
  try {
    const { date } = req.query
    const targetDate = date || new Date().toISOString().split('T')[0]
    const tasks = await dbStore.getTasks(req.userId, targetDate)
    res.json({ success: true, data: tasks })
  } catch (error) {
    next(error)
  }
}

export async function toggleTask(req, res, next) {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ success: false, error: 'Task ID is required' })
    }
    const updated = await dbStore.toggleTask(req.userId, id)
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    next(error)
  }
}

export async function generateTasks(req, res, next) {
  try {
    const { date } = req.body
    const targetDate = date || new Date().toISOString().split('T')[0]
    const profile  = await dbStore.getProfile(req.userId)
    const roadmap  = await dbStore.getRoadmap(req.userId)

    let taskList = []

    if (roadmap) {
      const skills    = roadmap.plan30?.skills    || []
      const resources = roadmap.plan30?.resources || []
      const projects  = roadmap.plan30?.projects  || []

      taskList = [
        {
          type:     'Learn',
          title:    `Study ${skills[0] || 'core concepts'}`,
          detail:   `Read ${resources[0] || 'official guide'} and write a summary`,
          duration: '35 min',
        },
        {
          type:     'Practice',
          title:    `Build component for ${projects[0] || 'your portfolio project'}`,
          detail:   'Start coding basic layout, local testing and push updates',
          duration: '50 min',
        },
        {
          type:     'Career',
          title:    `Update career profiles to focus on ${profile.goal}`,
          detail:   'Align bios, add primary projects, and set status to seeking internships',
          duration: '25 min',
        },
      ]
    } else {
      taskList = [
        { type: 'Learn',    title: 'Fundamentals study',               detail: 'Read one tutorial page and write a short summary',                    duration: '30 min' },
        { type: 'Practice', title: 'Solve 1 platform coding problem',  detail: 'Log into HackerRank or similar and solve a problem',                  duration: '40 min' },
        { type: 'Career',   title: 'Review goals roadmap',             detail: 'Confirm current milestones, dates and target skills',                  duration: '15 min' },
      ]
    }

    const saved = await dbStore.saveTasks(req.userId, targetDate, taskList)
    res.json({ success: true, data: saved })
  } catch (error) {
    next(error)
  }
}

export async function getProgress(req, res, next) {
  try {
    const logs = await dbStore.getProgressLogs(req.userId)
    res.json({ success: true, data: logs })
  } catch (error) {
    next(error)
  }
}
