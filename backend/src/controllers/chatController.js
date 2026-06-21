import { dbStore } from '../config/store.js'

const AI_TIMEOUT_MS = 30_000

export async function createChatReply(req, res, next) {
  const { message } = req.body

  if (!message || typeof message !== 'string' || !message.trim()) {
    const error = new Error('Message is required')
    error.status = 400
    return next(error)
  }

  try {
    const profile        = await dbStore.getProfile(req.userId)
    const today          = new Date().toISOString().split('T')[0]
    const tasks          = await dbStore.getTasks(req.userId, today)
    const completedTasks = tasks.filter(t => t.done).map(t => t.title)

    const reply = process.env.OPENROUTER_API_KEY
      ? await requestOpenRouter(message.trim(), profile, completedTasks)
      : createLocalReply(message.trim(), completedTasks, profile)

    res.json({ success: true, data: reply })
  } catch (error) {
    next(error)
  }
}

// ── OpenRouter helper with AbortController timeout ────────────────────────────

async function requestOpenRouter(message, profile, completedTasks) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method:  'POST',
      signal:  controller.signal,
      headers: {
        Authorization:  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
        'X-Title':      'AI Life OS',
      },
      body: JSON.stringify({
        model:           process.env.OPENROUTER_MODEL || 'qwen/qwen3-8b:free',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(profile, completedTasks) },
          { role: 'user',   content: message },
        ],
      }),
    })

    if (!response.ok) {
      const upstreamError = new Error('The AI provider could not generate a response')
      upstreamError.status = 502
      throw upstreamError
    }

    const data    = await response.json()
    const content = data.choices?.[0]?.message?.content

    try {
      return JSON.parse(content)
    } catch {
      return createLocalReply(message, completedTasks, profile)
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutError = new Error('AI provider did not respond in time')
      timeoutError.status = 504
      throw timeoutError
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildSystemPrompt(profile, completedTasks) {
  return `You are AI Life OS, an execution-focused career coach for students in India.
User profile: ${JSON.stringify(profile)}
Completed today: ${completedTasks.join(', ') || 'None'}
Every response must be concise and valid JSON with this exact shape:
{"text":"one sentence overview","sections":{"situation":"...","path":"...","action":"...","outcome":"...","timeline":"..."}}
Give realistic, budget-aware, time-bound advice. Never invent guaranteed job outcomes.`
}

function createLocalReply(message, completedTasks, profile) {
  const normalized = message.toLowerCase()
  const completedSummary = completedTasks.length
    ? `You have already completed ${completedTasks.length} task${completedTasks.length > 1 ? 's' : ''} today.`
    : 'You have not checked off a task yet today.'

  if (normalized.includes('project')) {
    return {
      text: `A small placement-prep tracker is the right first portfolio project because it matches your current skill level in ${profile.skills?.[0] || 'programming'} and your career goal.`,
      sections: {
        situation: `${completedSummary} You need a project that is useful, finishable, and easy to explain in an interview.`,
        path:      'Build a responsive tracker with daily goals, completion states, local storage, and a weekly summary.',
        action:    'Today, sketch three screens and create the project repository. Tomorrow, build the task list.',
        outcome:   'You will have a relevant project that demonstrates JavaScript, UI thinking, and consistent execution.',
        timeline:  'Plan: 1 day · MVP: 7 days · Polish and README: 3 days',
      },
    }
  }

  if (normalized.includes('easy') || normalized.includes('easier') || normalized.includes('overwhelm')) {
    return {
      text: 'Let us reduce the plan to one meaningful hour a day without losing momentum.',
      sections: {
        situation: `${completedSummary} Your ${profile.weeklyTime || '7-hour'} weekly limit means consistency matters more than long sessions.`,
        path:      'Use four learning days, two project days, and one review day. Keep each session to 60 minutes.',
        action:    'Do only the next unfinished task, then stop. Move anything else to tomorrow.',
        outcome:   'You will build a sustainable routine while still completing one portfolio project this month.',
        timeline:  'Daily: 60 min · Weekly review: Sunday · First project: 30 days',
      },
    }
  }

  return {
    text: 'Your best next move is the smallest unfinished action that strengthens both skills and internship readiness.',
    sections: {
      situation: `${completedSummary} Your goal is ${profile.goal || 'a software internship'}, with ${profile.weeklyTime || '7'} focused hours available each week.`,
      path:      'Finish foundations, practice two problems per session, and apply the concepts in one small project.',
      action:    'Start the next unchecked task now. Use a 25-minute focus timer and finish one clear outcome.',
      outcome:   'This keeps your weekly plan on track and builds evidence you can show on your resume.',
      timeline:  'Next action: 25 min · Weekly target: 7 hours · Portfolio foundation: 30 days',
    },
  }
}
