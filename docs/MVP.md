# MVP.md — Project Scope

This document defines the scope of the AI Life OS project.

## Project Name
AI Life OS

## One-line description
Your personal career, learning, and growth operating system.

## Core User Story
As a student, I want to define my skills, goals, budget, and time availability to generate a structured 30/90/180-day career roadmap and receive actionable daily learning and practice tasks.

## MVP Features (must-have for v1)
- [x] Feature 1: User Profiles (Degree, Skills, Budget, Weekly Free Time)
- [x] Feature 1.5: User Authentication (Supabase Auth Email/OAuth signup and logins)
- [x] Feature 2: AI Roadmap Generator (30/90/180-day intermediate learning paths)
- [x] Feature 3: Daily Action Planner (Learning, practice, and career task splits)
- [x] Feature 4: Progress Tracking (Dashboard streaks and task completion percentages)
- [x] Feature 5: AI Resume Analyzer (Upload PDF, extract scores and sections)
- [x] Feature 6: Conversational Coach (Interactive AI career advisor with SPAOT response format)

## Explicitly OUT of scope for v1
- Mobile native application (v2 target)
- WhatsApp chatbot integrations (v2 target)
- Voice assistant (v3 target)

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: Supabase (PostgreSQL with RLS) / MongoDB / Local JSON fallback
- Auth: Supabase Auth (JWT)
- External APIs: OpenRouter / Ollama (AI)
- Hosting: Vercel (frontend) + Render (backend)

## Success Criteria
- [ ] Deployed and accessible via public URL
- [x] Core user story works end-to-end
- [x] No console errors, responsive on mobile
