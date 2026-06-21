# VERCEL_DEPLOY.md — Deployment Guide

## Frontend (Vercel)
1. Push repo to GitHub.
2. Go to vercel.com → New Project → Import the repo.
3. Set **Root Directory** to `frontend`.
4. Framework preset: Vite.
5. Build command: `npm run build` (default).
6. Output directory: `dist` (default for Vite).
7. Add environment variables (prefixed with `VITE_` so Vite exposes them
   to the browser), e.g. `VITE_API_URL=https://your-backend.onrender.com`.
8. Deploy. Every push to `main` auto-redeploys.

## Backend (Render — free tier)
1. Go to render.com → New → Web Service → connect repo.
2. Root directory: `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `backend/.env.example`
   (DB connection string, API keys, etc.)
6. Render gives you a URL like `https://your-app.onrender.com` —
   use this as `VITE_API_URL` in the frontend.

## CORS reminder
Backend must allow requests from the deployed frontend's domain.
In `backend/src/app.js`:
```js
app.use(cors({ origin: process.env.FRONTEND_URL }));
```

## Local dev
- Frontend runs on `http://localhost:5173` (Vite default)
- Backend runs on `http://localhost:5000` (or whatever PORT is set)
- Set `VITE_API_URL=http://localhost:5000` in `frontend/.env.local` for
  local testing

## vercel.json (root, optional — only if deploying both from one repo)
A `vercel.json` is included at the project root in case you ever want to
deploy the backend as Vercel serverless functions instead of Render.
Most projects following this kit should just use Render for the backend.
