import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

const DEFAULT_PROFILE = {
  name: 'Arjun',
  degree: 'B.Tech',
  branch: 'Mechanical Engineering',
  year: 'Second year',
  skills: ['Basic C++', 'HTML fundamentals'],
  interests: ['Software development', 'Web development'],
  goal: 'Get a software internship',
  budget: '₹5,000',
  weeklyTime: '7 hours',
}

function getLocalData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      profiles: {},   // keyed by userId
      roadmaps: {},
      tasks: {},      // keyed by `${userId}::${date}`
      progressLogs: {}, // keyed by userId
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  try {
    const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
    // Migrate legacy single-user format
    if (raw.profile && !raw.profiles) {
      raw.profiles = { anon: raw.profile }
      raw.roadmaps = { anon: raw.roadmap }
      // migrate tasks array to keyed map
      const taskMap = {}
      for (const t of (raw.tasks || [])) {
        const key = `anon::${t.date}`
        taskMap[key] = taskMap[key] || []
        taskMap[key].push(t)
      }
      raw.tasks = taskMap
      const logMap = {}
      for (const l of (raw.progressLogs || [])) {
        const arr = logMap['anon'] || []
        arr.push(l)
        logMap['anon'] = arr
      }
      raw.progressLogs = logMap
      delete raw.profile
      delete raw.roadmap
      fs.writeFileSync(DB_FILE, JSON.stringify(raw, null, 2))
    }
    return raw
  } catch (err) {
    console.error('Error parsing db.json, resetting:', err)
    return { profiles: {}, roadmaps: {}, tasks: {}, progressLogs: {} }
  }
}

function saveLocalData(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

export const localStore = {
  async getProfile(userId) {
    const data = getLocalData()
    return data.profiles[userId] || DEFAULT_PROFILE
  },

  async saveProfile(userId, profileData) {
    const data = getLocalData()
    data.profiles[userId] = { ...(data.profiles[userId] || DEFAULT_PROFILE), ...profileData }
    saveLocalData(data)
    return data.profiles[userId]
  },

  async getRoadmap(userId) {
    const data = getLocalData()
    return data.roadmaps[userId] || null
  },

  async saveRoadmap(userId, roadmapData) {
    const data = getLocalData()
    data.roadmaps[userId] = roadmapData
    saveLocalData(data)
    return roadmapData
  },

  async getTasks(userId, date) {
    const data = getLocalData()
    return data.tasks[`${userId}::${date}`] || []
  },

  async saveTasks(userId, date, tasksList) {
    const data = getLocalData()
    const key = `${userId}::${date}`
    const mapped = tasksList.map(t => ({
      id: t.id || Math.random().toString(36).slice(2, 11),
      type: t.type,
      title: t.title,
      detail: t.detail,
      duration: t.duration,
      done: t.done || false,
      date,
    }))
    data.tasks[key] = mapped
    saveLocalData(data)
    return mapped
  },

  async toggleTask(userId, id) {
    const data = getLocalData()
    let found = null
    for (const key of Object.keys(data.tasks)) {
      if (!key.startsWith(`${userId}::`)) continue
      const t = data.tasks[key].find(x => x.id === id)
      if (t) {
        t.done = !t.done
        found = t
        break
      }
    }
    if (found) {
      saveLocalData(data)
      await this.syncProgressLog(userId, found.date)
    }
    return found
  },

  async syncProgressLog(userId, date) {
    const tasks = await this.getTasks(userId, date)
    const total = tasks.length
    if (total === 0) return
    const completed = tasks.filter(t => t.done).length
    const data = getLocalData()
    const logs = data.progressLogs[userId] || []
    const idx = logs.findIndex(l => l.date === date)
    const entry = { date, completedTasksCount: completed, totalTasksCount: total }
    if (idx >= 0) logs[idx] = entry
    else logs.push(entry)
    data.progressLogs[userId] = logs
    saveLocalData(data)
  },

  async getProgressLogs(userId) {
    const data = getLocalData()
    return (data.progressLogs[userId] || []).sort((a, b) => a.date.localeCompare(b.date))
  },
}
