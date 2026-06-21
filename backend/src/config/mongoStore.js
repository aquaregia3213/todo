import mongoose from 'mongoose'

// ── Schemas ─────────────────────────────────────────────────────────────────

const ProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  degree: String,
  branch: String,
  year: String,
  skills: [String],
  interests: [String],
  goal: String,
  budget: String,
  weeklyTime: String,
})

const RoadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  plan30: {
    skills: [String],
    resources: [String],
    projects: [String],
  },
  plan90: {
    goals: [String],
    projects: [String],
  },
  plan180: {
    prep: [String],
    readiness: [String],
  },
  createdAt: { type: Date, default: Date.now },
})

const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  id: String,
  type: String,
  title: String,
  detail: String,
  duration: String,
  done: Boolean,
  date: String,
})

const ProgressLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: String,
  completedTasksCount: Number,
  totalTasksCount: Number,
})

const ProfileModel = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema)
const RoadmapModel = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema)
const TaskModel = mongoose.models.Task || mongoose.model('Task', TaskSchema)
const ProgressLogModel = mongoose.models.ProgressLog || mongoose.model('ProgressLog', ProgressLogSchema)

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

// ── Adapter ──────────────────────────────────────────────────────────────────

export const mongoStore = {
  async getProfile(userId) {
    let p = await ProfileModel.findOne({ userId })
    if (!p) {
      p = await ProfileModel.create({ userId, ...DEFAULT_PROFILE })
    }
    return p
  },

  async saveProfile(userId, profileData) {
    const p = await ProfileModel.findOneAndUpdate(
      { userId },
      { $set: profileData },
      { upsert: true, new: true }
    )
    return p
  },

  async getRoadmap(userId) {
    return await RoadmapModel.findOne({ userId }).sort({ createdAt: -1 })
  },

  async saveRoadmap(userId, roadmapData) {
    await RoadmapModel.deleteMany({ userId })
    return await RoadmapModel.create({ userId, ...roadmapData })
  },

  async getTasks(userId, date) {
    return await TaskModel.find({ userId, date })
  },

  async saveTasks(userId, date, tasksList) {
    await TaskModel.deleteMany({ userId, date })
    const created = []
    for (const t of tasksList) {
      const item = await TaskModel.create({
        userId,
        id: t.id || Math.random().toString(36).slice(2, 11),
        type: t.type,
        title: t.title,
        detail: t.detail,
        duration: t.duration,
        done: t.done || false,
        date,
      })
      created.push(item)
    }
    return created
  },

  async toggleTask(userId, id) {
    const t = await TaskModel.findOne({ userId, id })
    if (!t) return null
    t.done = !t.done
    await t.save()
    await this.syncProgressLog(userId, t.date)
    return t
  },

  async syncProgressLog(userId, date) {
    const tasks = await TaskModel.find({ userId, date })
    const total = tasks.length
    if (total === 0) return
    const completed = tasks.filter(t => t.done).length
    await ProgressLogModel.findOneAndUpdate(
      { userId, date },
      { completedTasksCount: completed, totalTasksCount: total },
      { upsert: true, new: true }
    )
  },

  async getProgressLogs(userId) {
    return await ProgressLogModel.find({ userId }).sort({ date: 1 })
  },
}
