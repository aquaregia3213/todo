# TODO - Backend improvements + Supabase integration

## Phase 1: Security & performance hardening
- [ ] Add `helmet` middleware in `backend/src/app.js`
- [ ] Add `express-rate-limit` for AI endpoints: `/api/chat`, `/api/resume/*`, `/api/roadmap/generate`
- [ ] Lock CORS to `FRONTEND_URL` (avoid `'*'` in production)
- [ ] Add express JSON/body size limits
- [ ] Add request-id middleware and improve `errorHandler` response consistency
- [ ] Add OpenRouter/AI fetch timeouts (AbortController) + map provider errors to 502/504

## Phase 2: Persistence refactor (adapter approach)
- [ ] Define a store interface (methods used by controllers)
- [ ] Refactor existing `dbStore` into `localStore` and `mongoStore` adapters
- [ ] Create `supabaseStore` adapter implementing the same interface
- [ ] Add env-based store selection (supabase > mongo > local)

## Phase 3: Supabase schema + RLS
- [ ] Create SQL for tables: `profiles`, `roadmaps`, `tasks`, `progress_logs`
- [ ] Enable RLS and create policies for per-user access

## Phase 4: Per-user data + auth readiness
- [ ] Update controllers to pass `userId` into store methods
- [ ] Add auth middleware (Supabase JWT verification) OR temporary `userId` header for local testing

## Phase 5: Integration validation
- [ ] Run backend locally; smoke test all endpoints
- [ ] Validate Supabase reads/writes and progressLog correctness
- [ ] Validate rate limits and timeout handling

# Integration 
- Supabase url "https://akvxtcwzztyuknusmyhs.supabase.co"  
anon public key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrdnh0Y3d6enR5dWtudXNteWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mzk2NTIsImV4cCI6MjA5NzExNTY1Mn0.GaT1TUov5iFkPcdaJRcfaW-ejh2MZoDGDbkjER1cP7Q"