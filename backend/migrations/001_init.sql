-- ============================================================
-- 001_init.sql  –  AI Life OS schema
-- Run once in your Supabase SQL Editor or via migrate.js
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT        NOT NULL UNIQUE,
  name         TEXT,
  degree       TEXT,
  branch       TEXT,
  year         TEXT,
  skills       TEXT[]      NOT NULL DEFAULT '{}',
  interests    TEXT[]      NOT NULL DEFAULT '{}',
  goal         TEXT,
  budget       TEXT,
  weekly_time  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── roadmaps ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmaps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,
  plan_30     JSONB,
  plan_90     JSONB,
  plan_180    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS roadmaps_user_id_idx ON roadmaps (user_id, created_at DESC);

-- ── tasks ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,
  task_id     TEXT        NOT NULL,  -- app-level id (short alphanumeric)
  type        TEXT,
  title       TEXT,
  detail      TEXT,
  duration    TEXT,
  done        BOOLEAN     NOT NULL DEFAULT FALSE,
  date        DATE        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_user_date_idx ON tasks (user_id, date);

-- ── progress_logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress_logs (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT        NOT NULL,
  date                  DATE        NOT NULL,
  completed_tasks_count INTEGER     NOT NULL DEFAULT 0,
  total_tasks_count     INTEGER     NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS progress_logs_user_id_idx ON progress_logs (user_id, date);


-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- profiles
DO $$ BEGIN
  CREATE POLICY "profiles_select" ON profiles
    FOR SELECT USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_update" ON profiles
    FOR UPDATE USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- roadmaps
DO $$ BEGIN
  CREATE POLICY "roadmaps_select" ON roadmaps
    FOR SELECT USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "roadmaps_insert" ON roadmaps
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "roadmaps_delete" ON roadmaps
    FOR DELETE USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- tasks
DO $$ BEGIN
  CREATE POLICY "tasks_select" ON tasks
    FOR SELECT USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tasks_insert" ON tasks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tasks_update" ON tasks
    FOR UPDATE USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tasks_delete" ON tasks
    FOR DELETE USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- progress_logs
DO $$ BEGIN
  CREATE POLICY "progress_logs_select" ON progress_logs
    FOR SELECT USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "progress_logs_insert" ON progress_logs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "progress_logs_update" ON progress_logs
    FOR UPDATE USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
