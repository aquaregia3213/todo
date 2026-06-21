import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Helper to dynamically inject active session's JWT.
 * Returns Headers object compatible with fetch.
 */
async function getAuthHeaders(contentType = 'application/json') {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = {}
  if (contentType) {
    headers['Content-Type'] = contentType
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  return headers
}

export async function fetchHealth() {
  const res = await fetch(`${API_URL}/api/health`)
  if (!res.ok) throw new Error('Health check failed')
  return res.json()
}

export async function sendChatMessage(payload) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to send message')
  return body
}

export async function fetchProfile() {
  const headers = await getAuthHeaders(null)
  const res = await fetch(`${API_URL}/api/profile`, { headers })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to fetch profile')
  return body.data
}

export async function saveProfile(profile) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'POST',
    headers,
    body: JSON.stringify(profile),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to save profile')
  return body.data
}

export async function fetchRoadmap() {
  const headers = await getAuthHeaders(null)
  const res = await fetch(`${API_URL}/api/roadmap`, { headers })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to fetch roadmap')
  return body.data
}

export async function generateRoadmap() {
  const headers = await getAuthHeaders(null)
  const res = await fetch(`${API_URL}/api/roadmap/generate`, {
    method: 'POST',
    headers,
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to generate roadmap')
  return body.data
}

export async function fetchTasks(date) {
  const query = date ? `?date=${date}` : ''
  const headers = await getAuthHeaders(null)
  const res = await fetch(`${API_URL}/api/tasks${query}`, { headers })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to fetch tasks')
  return body.data
}

export async function toggleTask(id) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/api/tasks/toggle`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to toggle task')
  return body.data
}

export async function fetchProgress() {
  const headers = await getAuthHeaders(null)
  const res = await fetch(`${API_URL}/api/tasks/progress`, { headers })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to fetch progress')
  return body.data
}

export async function analyzeResume(file) {
  // Let fetch handle boundary generation for form-data (so contentType is null)
  const headers = await getAuthHeaders(null)
  const formData = new FormData()
  formData.append('resume', file)
  
  const res = await fetch(`${API_URL}/api/resume/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error || 'Failed to analyze resume')
  return body.data
}
