/**
 * migrate.js — one-time Supabase schema setup
 *
 * Usage:
 *   cd backend
 *   node scripts/migrate.js
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
  process.exit(1)
}

const sql = readFileSync(
  join(__dirname, '../migrations/001_init.sql'),
  'utf-8'
)

// Split into individual statements (skip empty lines / comments)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'))

const ref = new URL(SUPABASE_URL).hostname.split('.')[0]

console.log(`\n🚀  Running migration against project: ${ref}`)
console.log(`    ${statements.length} SQL statements to execute\n`)

let passed = 0
let failed = 0

for (const stmt of statements) {
  const preview = stmt.replace(/\s+/g, ' ').slice(0, 60)
  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${ref}/database/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: stmt + ';' }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      // 42P07 = relation already exists — safe to ignore
      if (text.includes('42P07') || text.includes('already exists')) {
        console.log(`  ⚠  [skip] ${preview}...`)
      } else {
        console.error(`  ✗  [fail] ${preview}...\n     ${text}`)
        failed++
      }
    } else {
      console.log(`  ✓  ${preview}...`)
      passed++
    }
  } catch (err) {
    console.error(`  ✗  [error] ${preview}...\n     ${err.message}`)
    failed++
  }
}

console.log(`\n📊  Done: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('\n⚠   Some statements failed. Check above for details.')
  console.log('    You can also paste migrations/001_init.sql directly into the Supabase SQL Editor.')
} else {
  console.log('\n✅  Schema is ready!')
}
