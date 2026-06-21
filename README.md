# 🌌 AI Life OS

> **Your personal career, learning, and growth operating system.** Turn your goals, skills, budget, and available time into a focused daily plan and long-term execution roadmap.

Unlike generic AI assistants that only answer one-off questions, **AI Life OS** is designed to guide execution. It takes your unique student profile and generates actionable, structured timelines to get you from where you are to where you want to be.

---

## 🚀 Key Features

*   **👤 Comprehensive User Profile**: Tailors plans based on your degree, branch, current skills, budget, and weekly available time.
*   **🗺️ AI Roadmap Generator**: Instantly produces structured **30-day**, **90-day**, and **6-month** learning and action plans.
*   **📅 Daily Action Planner**: Translates your long-term roadmap into three focus areas for today: *Learning tasks*, *Practice tasks*, and *Career tasks*.
*   **📈 Progress & Streak Tracking**: Log completed tasks, maintain daily streaks, and view completion rates on an interactive dashboard.
*   **📄 AI Resume Analyzer**: Upload your resume PDF to receive a score, identify missing sections, and get specific recommendations.
*   **💬 Interactive AI Career Coach**: Chat with an AI coach that frames every response around your current situation, recommended path, immediate actions, outcomes, and timelines.

---

## ⚙️ Tech Stack & Architecture

AI Life OS is built on a modern, decoupled architecture designed for rapid development and zero-cost deployment:

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + Tailwind CSS | Built with clean component-driven architecture, fully responsive, dark-mode styling. |
| **Backend** | Node.js + Express | RESTful API built with modern ES Modules, customized middleware (security, request logs, and rate-limiting). |
| **Database** | Supabase (PostgreSQL) | Secure relational database with custom Row-Level Security (RLS) policies. |
| **Alternative DB** | MongoDB / Local JSON fallback | Flexible storage adapter interface. Selects database automatically based on environment variables. |
| **AI Integration**| OpenRouter / Ollama | Production uses OpenRouter (Qwen/DeepSeek/Llama); local development supports Ollama. |

---

## 📂 Project Structure

The project is organized as a monorepo with distinct frontend and backend directories:

```text
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components (Sidebar, Profile, ProgressView, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # API wrapper for backend fetch calls
│   │   ├── App.jsx        # Main application layout and state
│   │   └── index.css      # Design tokens and tailwind imports
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/        # Store adapters (Supabase, MongoDB, Local JSON fallback)
│   │   ├── controllers/   # Route handler controllers (chat, profile, resume, tasks, roadmap)
│   │   ├── middleware/    # Auth, security, custom error handler
│   │   ├── routes/        # Express API endpoints
│   │   └── app.js         # Express configuration
│   ├── migrations/        # PostgreSQL / Supabase SQL schema migrations
│   ├── scripts/           # Migration execution scripts
│   └── package.json
│
├── docs/                  # Project specifications, MVP scopes, and guidelines
└── README.md              # Project documentation
```

---

## 🛠️ Installation & Local Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Configure the Backend
Navigate to the backend directory, copy the environment template, and install dependencies:

```bash
cd backend
cp .env.example .env
npm install
```

Configure your `.env` file:
*   **Database**: Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to connect to your Supabase project. If left empty, the application will fallback to a local JSON file store (`data/local_db.json`).
*   **AI Access**: Provide an `OPENROUTER_API_KEY` to enable the AI coach.

#### Run Database Migrations (Supabase only)
If using Supabase, apply the SQL schema and RLS policies:
```bash
node scripts/migrate.js
```
*(Alternatively, copy the contents of `backend/migrations/001_init.sql` and run them directly in the Supabase SQL Editor.)*

#### Start Backend Server
```bash
npm run dev
```
The backend server runs at `http://localhost:5000`.

### 3. Configure the Frontend
Navigate to the frontend directory, configure the environment, and install dependencies:

```bash
cd ../frontend
cp .env.example .env.local
npm install
```

Configure your `.env.local` file with your Supabase credentials to enable the user signup and login flows:
*   **VITE_SUPABASE_URL**: Your public Supabase URL (`https://<your-project-ref>.supabase.co`).
*   **VITE_SUPABASE_ANON_KEY**: Your public Supabase anonymous key.

#### Start Frontend Application
```bash
npm run dev
```
The React development server will start at `http://localhost:5173`.

---

## 🗄️ Database Schema Reference

The Supabase adapter maps data to four main PostgreSQL tables:

### 1. `profiles`
Stores student information and career targets.
```sql
CREATE TABLE profiles (
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
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. `roadmaps`
Stores 30/90/180-day personalized career milestones.
```sql
CREATE TABLE roadmaps (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,
  plan_30     JSONB,
  plan_90     JSONB,
  plan_180    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. `tasks`
Stores daily tasks generated for each student.
```sql
CREATE TABLE tasks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT        NOT NULL,
  task_id     TEXT        NOT NULL, -- Short app-level alphanumeric ID
  type        TEXT,                 -- e.g., 'learning', 'practice', 'career'
  title       TEXT,
  detail      TEXT,
  duration    TEXT,
  done        BOOLEAN     DEFAULT FALSE,
  date        DATE        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. `progress_logs`
Logs high-level stats for dashboard analytics.
```sql
CREATE TABLE progress_logs (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT    NOT NULL,
  date                  DATE    NOT NULL,
  completed_tasks_count INTEGER DEFAULT 0,
  total_tasks_count     INTEGER DEFAULT 0,
  UNIQUE (user_id, date)
);
```

*Note: All tables have **Row Level Security (RLS)** enabled, restricting read/write access to matching `auth.uid()` or the project service role.*

---

## 🔒 Security & Reliability (Phase 1 Checklist)
*   **Helmet Middleware**: Secures HTTP headers on all API routes.
*   **Rate Limiting**: Protects expensive AI generation routes (`/api/chat`, `/api/resume/analyze`, `/api/roadmap/generate`) from abuse.
*   **Strict CORS Policy**: Restricted to authorized `FRONTEND_URL` clients.
*   **Request Auditing**: Track lifecycle logs via Request ID middleware.
