import dotenv from 'dotenv'
dotenv.config()

try {
  const { requestId } = await import('../src/middleware/requestId.js')
  const { errorHandler } = await import('../src/middleware/errorHandler.js')
  const { authMiddleware } = await import('../src/middleware/authMiddleware.js')
  const { localStore } = await import('../src/config/localStore.js')
  const { mongoStore } = await import('../src/config/mongoStore.js')
  const { supabaseStore } = await import('../src/config/supabaseStore.js')
  const { dbStore } = await import('../src/config/store.js')
  console.log('✅  All imports resolve correctly')
  console.log(`✅  Active store: ${dbStore === supabaseStore ? 'Supabase' : dbStore === mongoStore ? 'MongoDB' : 'Local'}`)
  process.exit(0)
} catch (err) {
  console.error('❌  Import error:', err.message)
  process.exit(1)
}
