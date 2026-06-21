# AGENTS.md — Instructions for AI Coding Agents

This file is the entry point for any AI agent (Claude, GPT, Copilot, etc.)
working on this project. Read this fully before writing any code.

## Project Structure

```
/frontend   -> React (Vite) app
/backend    -> Node.js + Express API
/docs       -> Project docs, skills, and guidelines
```

## Golden Rules

1. **Don't re-explain the stack.** Frontend = React + Vite + Tailwind.
   Backend = Node.js + Express + MongoDB (or PostgreSQL, see /backend/README.md).
   Deployment = Vercel (frontend) + Render (backend).
2. **MVP first.** Always check `/docs/MVP.md` before adding features.
   If a feature isn't in the MVP scope, flag it instead of building it
   silently.
3. **Follow `/docs/WEB_GUIDELINES.md`** for code style, folder conventions,
   API design, and error handling — don't ask, just follow it.
4. **Follow `/docs/FRONTEND_SKILL.md`** for any UI/design work.
5. **Keep changes scoped.** Don't refactor unrelated files unless asked.
6. **Environment variables** go in `.env` (never commit). Use `.env.example`
   to document required keys.
7. **Commit messages**: short, imperative ("Add air quality API route",
   not "Added stuff").

## Quick Commands

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev
```

## Where to look for things

| Need to...                  | Look at                         |
|------------------------------|----------------------------------|
| Add a UI component            | `/frontend/src/components`      |
| Add a page/route               | `/frontend/src/pages`           |
| Add an API endpoint             | `/backend/src/routes`           |
| Add a DB model                  | `/backend/src/models`           |
| Check project scope             | `/docs/MVP.md`                  |
| Check coding/style rules        | `/docs/WEB_GUIDELINES.md`        |
| Check design/UI rules            | `/docs/FRONTEND_SKILL.md`        |
| Deploy                            | `/docs/VERCEL_DEPLOY.md`         |

## Token-saving note for agents

This repo is pre-structured specifically so agents don't need to ask
clarifying questions about stack, structure, or conventions — they're
all answered in `/docs`. Read `/docs` once per session, then work directly.
