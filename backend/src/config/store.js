/**
 * store.js — env-based store selector
 *
 * Priority: supabase > mongo > local
 *
 * Each adapter implements the same interface:
 *   getProfile(userId)
 *   saveProfile(userId, profileData)
 *   getRoadmap(userId)
 *   saveRoadmap(userId, roadmapData)
 *   getTasks(userId, date)
 *   saveTasks(userId, date, tasksList)
 *   toggleTask(userId, id)
 *   syncProgressLog(userId, date)
 *   getProgressLogs(userId)
 */

import { supabaseStore } from './supabaseStore.js'
import { mongoStore } from './mongoStore.js'
import { localStore } from './localStore.js'

function selectStore() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[store] Using Supabase adapter')
    return supabaseStore
  }
  if (process.env.MONGODB_URI) {
    console.log('[store] Using MongoDB adapter')
    return mongoStore
  }
  console.log('[store] Using local JSON file adapter')
  return localStore
}

export const dbStore = selectStore()
