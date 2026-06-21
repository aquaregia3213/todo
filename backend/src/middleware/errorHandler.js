/**
 * Centralised error handler.
 * Attaches X-Request-Id to every error response for easy correlation.
 */
export function errorHandler(err, req, res, next) {
  // Avoid logging stack for expected client errors
  if (!err.status || err.status >= 500) {
    console.error(`[${req.id || '-'}] ${err.stack || err.message}`)
  } else {
    console.warn(`[${req.id || '-'}] ${err.status} – ${err.message}`)
  }

  const status = err.status || 500
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
    requestId: req.id,
  })
}
