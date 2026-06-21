import { randomUUID } from 'crypto'

/**
 * Attaches a unique X-Request-Id to every request and response.
 * If the client already sent one, it is preserved.
 */
export function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID()
  res.setHeader('X-Request-Id', req.id)
  next()
}
