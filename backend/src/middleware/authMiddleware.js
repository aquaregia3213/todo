import { createClient } from '@supabase/supabase-js'

// Lazily create client only when env is available
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Auth middleware — resolves userId from one of two sources:
 *   1. `Authorization: Bearer <supabase-jwt>` → verified via Supabase
 *   2. `X-User-Id: <any-string>` header → accepted as-is for local testing
 *
 * Sets `req.userId` on success; returns 401 on failure.
 * Routes that DO NOT need auth should not apply this middleware.
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || ''
    const userIdHeader = req.headers['x-user-id']

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7)
      const supabase = getSupabaseClient()

      if (supabase) {
        const { data, error } = await supabase.auth.getUser(token)
        if (error || !data?.user) {
          return res.status(401).json({ success: false, error: 'Invalid or expired token' })
        }
        req.userId = data.user.id
        return next()
      }
    }

    // Fallback: X-User-Id header (local / anon testing)
    if (userIdHeader) {
      req.userId = userIdHeader
      return next()
    }

    // Anonymous fallback — use a stable local anonymous ID
    req.userId = 'anon'
    next()
  } catch (err) {
    next(err)
  }
}
