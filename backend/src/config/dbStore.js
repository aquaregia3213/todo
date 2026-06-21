import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

// Helper to ensure JSON file exists and contains initial structure
function getLocalData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      profile: {
        name: 'Arjun',
        degree: 'B.Tech',
        branch: 'Mechanical Engineering',
        year: 'Second year',
        skills: ['Basic C++', 'HTML fundamentals'],
        interests: ['Software development', 'Web development'],
        goal: 'Get a software internship',
        budget: '₹5,000',
        weeklyTime: '7 hours'
      },
      roadmap: null,
      tasks: [
        { id: '1', type: 'Learn', title: 'JavaScript arrays & objects', detail: 'Complete one focused lesson', duration: '35 min', done: true, date: '2026-06-14' },
        { id: '2', type: 'Practice', title: 'Solve 2 array problems', detail: 'Use HackerRank or LeetCode', duration: '45 min', done: false, date: '2026-06-14' },
        { id: '3', type: 'Career', title: 'Rewrite your resume summary', detail: 'Lead with projects and C++ skills', duration: '20 min', done: false, date: '2026-06-14' }
      ],
      progressLogs: []
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
  } catch (err) {
    console.error('Error parsing db.json, resetting database file:', err)
    return {}
  }
}

function saveLocalData(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

// Check if mongoose is connected
function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1
}

// Define Mongoose Schemas if mongoose is connected
const ProfileSchema = new mongoose.Schema({
  name: String,
  degree: String,
  branch: String,
  year: String,
  skills: [String],
  interests: [String],
  goal: String,
  budget: String,
  weeklyTime: String
})

const RoadmapSchema = new mongoose.Schema({
  plan30: {
    skills: [String],
    resources: [String],
    projects: [String]
  },
  plan90: {
    goals: [String],
    projects: [String]
  },
  plan180: {
    prep: [String],
    readiness: [String]
  },
  createdAt: { type: Date, default: Date.now }
})

const TaskSchema = new mongoose.Schema({
  id: String,
  type: String,
  title: String,
  detail: String,
  duration: String,
  done: Boolean,
  date: String // YYYY-MM-DD
})

const ProgressLogSchema = new mongoose.Schema({
  date: String,
  completedTasksCount: Number,
  totalTasksCount: Number
})

const ProfileModel = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema)
const RoadmapModel = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema)
const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema)
const ProgressLogModel = mongoose.models.ProgressLog || mongoose.model('ProgressLog', ProgressLogSchema)

export const dbStore = {
  async getProfile() {
    if (isDbConnected()) {
      let p = await ProfileModel.findOne()
      if (!p) {
        // seed initial
        const def = getLocalData().profile
        p = await ProfileModel.create(def)
      }
      return p
    } else {
      return getLocalData().profile
    }
  },

  async saveProfile(profileData) {
    if (isDbConnected()) {
      let p = await ProfileModel.findOne()
      if (p) {
        Object.assign(p, profileData)
        await p.save()
        return p
      } else {
        return await ProfileModel.create(profileData)
      }
    } else {
      const data = getLocalData()
      data.profile = { ...data.profile, ...profileData }
      saveLocalData(data)
      return data.profile
    }
  },

  async getRoadmap() {
    if (isDbConnected()) {
      return await RoadmapModel.findOne().sort({ createdAt: -1 })
    } else {
      return getLocalData().roadmap
    }
  },

  async saveRoadmap(roadmapData) {
    if (isDbConnected()) {
      // Clean previous roadmaps
      await RoadmapModel.deleteMany({})
      return await RoadmapModel.create(roadmapData)
    } else {
      const data = getLocalData()
      data.roadmap = roadmapData
      saveLocalData(data)
      return data.roadmap
    }
  },

  async getTasks(date) {
    if (isDbConnected()) {
      return await TaskModel.find({ date })
    } else {
      const data = getLocalData()
      return data.tasks.filter(t => t.date === date)
    }
  },

  async saveTasks(date, tasksList) {
    if (isDbConnected()) {
      // Clear tasks for the date
      await TaskModel.deleteMany({ date })
      const created = []
      for (const t of tasksList) {
        const item = await TaskModel.create({
          id: t.id || Math.random().toString(36).substr(2, 9),
          type: t.type,
          title: t.title,
          detail: t.detail,
          duration: t.duration,
          done: t.done || false,
          date
        })
        created.push(item)
      }
      return created
    } else {
      const data = getLocalData()
      // remove old ones for this date
      data.tasks = data.tasks.filter(t => t.date !== date)
      // add new ones
      const mapped = tasksList.map(t => ({
        id: t.id || Math.random().toString(36).substr(2, 9),
        type: t.type,
        title: t.title,
        detail: t.detail,
        duration: t.duration,
        done: t.done || false,
        date
      }))
      data.tasks.push(...mapped)
      saveLocalData(data)
      return mapped
    }
  },

  async toggleTask(id) {
    if (isDbConnected()) {
      const t = await TaskModel.findOne({ id })
      if (t) {
        t.done = !t.done
        await t.save()
        
        // update progress log for that day
        await this.syncProgressLog(t.date)
        return t
      }
      return null
    } else {
      const data = getLocalData()
      const t = data.tasks.find(x => x.id === id)
      if (t) {
        t.done = !t.done
        saveLocalData(data)
        this.syncProgressLog(t.date)
        return t
      }
      return null
    }
  },

  async syncProgressLog(date) {
    if (isDbConnected()) {
      const tasks = await TaskModel.find({ date })
      const completed = tasks.filter(t => t.done).length
      const total = tasks.length
      if (total > 0) {
        await ProgressLogModel.findOneAndUpdate(
          { date },
          { completedTasksCount: completed, totalTasksCount: total },
          { upsert: true, new: true }
        )
      }
    } else {
      const data = getLocalData()
      const dayTasks = data.tasks.filter(t => t.date === date)
      const completed = dayTasks.filter(t => t.done).length
      const total = dayTasks.length
      if (total > 0) {
        const idx = data.progressLogs.findIndex(p => p.date === date)
        if (idx >= 0) {
          data.progressLogs[idx].completedTasksCount = completed
          data.progressLogs[idx].totalTasksCount = total
        } else {
          data.progressLogs.push({ date, completedTasksCount: completed, totalTasksCount: total })
        }
        saveLocalData(data)
      }
    }
  },

  async getProgressLogs() {
    if (isDbConnected()) {
      return await ProgressLogModel.find().sort({ date: 1 })
    } else {
      return getLocalData().progressLogs
    }
  }
}
