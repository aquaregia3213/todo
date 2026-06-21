/**
 * Entry point — loads environment variables BEFORE any other module
 * so the store selector (store.js) can read SUPABASE_URL at import time.
 *
 * In Node.js ESM, static `import` declarations are hoisted above all code,
 * so dotenv.config() inside app.js would run AFTER all imports complete.
 * Using `--import` or a separate loader file solves this cleanly.
 */
import { config } from 'dotenv'
config()

// Now import app.js — all its transitive imports will see process.env
await import('./app.js')
