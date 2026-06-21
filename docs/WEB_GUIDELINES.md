# WEB_GUIDELINES.md — Coding & Project Conventions

## General
- Use ES modules (`import`/`export`), not `require`/`module.exports`.
- Use `async/await`, not `.then()` chains.
- Keep functions small and named for what they do.
- Never hardcode secrets — use `.env` + `.env.example`.

## Frontend (React + Vite + Tailwind)
- Functional components + hooks only (no class components).
- One component per file, named the same as the file (`Navbar.jsx`).
- Folder structure:
  ```
  src/
    components/   -> reusable UI pieces (Button, Card, Navbar)
    pages/         -> route-level views (Home, Dashboard)
    hooks/         -> custom hooks (useFetch, useAuth)
    lib/           -> API clients, helper functions
    assets/        -> images, icons
  ```
- Use Tailwind utility classes; avoid inline styles and custom CSS unless
  Tailwind can't do it.
- Fetch data via a small `lib/api.js` wrapper, not scattered `fetch()` calls.
- Handle loading, error, and empty states for every data-fetching component.

## Backend (Node.js + Express)
- Folder structure:
  ```
  src/
    routes/    -> Express route definitions
    controllers/ -> business logic for each route
    models/     -> Mongoose/Sequelize schemas
    middleware/ -> auth, error handling, validation
    config/     -> DB connection, env setup
  ```
- Every route: validate input -> call controller -> return JSON
  `{ success: true/false, data/error }`.
- Centralized error handler middleware — don't try/catch every route manually
  if you can avoid it.
- Use `dotenv` for config; never log secrets.

## API Design
- RESTful naming: `/api/cities`, `/api/cities/:id`, `/api/cities/:id/aqi`
- Use proper HTTP status codes (200, 201, 400, 404, 500).
- Version APIs if breaking changes are likely: `/api/v1/...`

## Git & Commits
- Branch naming: `feature/short-name`, `fix/short-name`
- Commit messages: imperative, present tense, < 60 chars
- `.gitignore` must include `node_modules/`, `.env`, `dist/`, `build/`

## Environment Variables
- `.env.example` lists every variable with a placeholder value
- Never commit real `.env` files

## Testing (when relevant)
- Backend: basic route tests with Jest + Supertest
- Frontend: component tests with Vitest + React Testing Library
- Not required for MVP, but structure code so tests are easy to add later

## Performance & Accessibility baseline
- Images: use `loading="lazy"` where appropriate
- All interactive elements keyboard-accessible, visible focus states
- Respect `prefers-reduced-motion` for animations
- Mobile-first responsive design
