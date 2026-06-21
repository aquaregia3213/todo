import { createClient } from '@supabase/supabase-js'

// ── Client ───────────────────────────────────────────────────────────────────

let _client = null

function getClient() {
  if (_client) return _client
  _client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
  return _client
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

/** Convert snake_case DB row → camelCase app object */
function toProfile(row) {
  if (!row) return null
  return {
    name: row.name,
    degree: row.degree,
    branch: row.branch,
    year: row.year,
    skills: row.skills || [],
    interests: row.interests || [],
    goal: row.goal,
    budget: row.budget,
    weeklyTime: row.weekly_time,
  }
}

function toRoadmap(row) {
  if (!row) return null
  return {
    plan30: row.plan_30,
    plan90: row.plan_90,
    plan180: row.plan_180,
    createdAt: row.created_at,
  }
}

function toTask(row) {
  if (!row) return null
  return {
    id: row.task_id,
    type: row.type,
    title: row.title,
    detail: row.detail,
    duration: row.duration,
    done: row.done,
    date: row.date,
  }
}

function toProgressLog(row) {
  if (!row) return null
  return {
    date: row.date,
    completedTasksCount: row.completed_tasks_count,
    totalTasksCount: row.total_tasks_count,
  }
}

// ── Adapter ──────────────────────────────────────────────────────────────────

export const supabaseStore = {
  async getProfile(userId) {
    const sb = getClient()
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error

    if (!data) {
      // Seed default profile for new user
      return this.saveProfile(userId, DEFAULT_PROFILE)
    }
    return toProfile(data)
  },

  async saveProfile(userId, profileData) {
    const sb = getClient()
    const { data, error } = await sb
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          name: profileData.name,
          degree: profileData.degree,
          branch: profileData.branch,
          year: profileData.year,
          skills: profileData.skills || [],
          interests: profileData.interests || [],
          goal: profileData.goal,
          budget: profileData.budget,
          weekly_time: profileData.weeklyTime,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) throw error
    return toProfile(data)
  },

  async getRoadmap(userId) {
    const sb = getClient()
    const { data, error } = await sb
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return toRoadmap(data)
  },

  async saveRoadmap(userId, roadmapData) {
    const sb = getClient()

    // Delete old roadmaps for this user then insert fresh
    await sb.from('roadmaps').delete().eq('user_id', userId)

    const { data, error } = await sb
      .from('roadmaps')
      .insert({
        user_id: userId,
        plan_30: roadmapData.plan30,
        plan_90: roadmapData.plan90,
        plan_180: roadmapData.plan180,
      })
      .select()
      .single()

    if (error) throw error
    return toRoadmap(data)
  },

  async getTasks(userId, date) {
    const sb = getClient()
    const { data, error } = await sb
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)

    if (error) throw error
    return (data || []).map(toTask)
  },

  async saveTasks(userId, date, tasksList) {
    const sb = getClient()

    // Clear existing tasks for this user+date
    await sb.from('tasks').delete().eq('user_id', userId).eq('date', date)

    const rows = tasksList.map(t => ({
      user_id: userId,
      task_id: t.id || Math.random().toString(36).slice(2, 11),
      type: t.type,
      title: t.title,
      detail: t.detail,
      duration: t.duration,
      done: t.done || false,
      date,
    }))

    const { data, error } = await sb.from('tasks').insert(rows).select()
    if (error) throw error
    return (data || []).map(toTask)
  },

  async toggleTask(userId, id) {
    const sb = getClient()

    // Fetch the task first
    const { data: rows, error: fetchErr } = await sb
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', id)
      .limit(1)

    if (fetchErr) throw fetchErr
    if (!rows || rows.length === 0) return null

    const row = rows[0]
    const newDone = !row.done

    const { data, error } = await sb
      .from('tasks')
      .update({ done: newDone })
      .eq('id', row.id)
      .select()
      .single()

    if (error) throw error
    await this.syncProgressLog(userId, row.date)
    return toTask(data)
  },

  async syncProgressLog(userId, date) {
    const tasks = await this.getTasks(userId, date)
    const total = tasks.length
    if (total === 0) return
    const completed = tasks.filter(t => t.done).length

    const sb = getClient()
    const { error } = await sb
      .from('progress_logs')
      .upsert(
        {
          user_id: userId,
          date,
          completed_tasks_count: completed,
          total_tasks_count: total,
        },
        { onConflict: 'user_id,date' }
      )

    if (error) throw error
  },

  async getProgressLogs(userId) {
    const sb = getClient()
    const { data, error } = await sb
      .from('progress_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (error) throw error
    return (data || []).map(toProgressLog)
  },
}
