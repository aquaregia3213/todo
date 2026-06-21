import { dbStore } from '../config/store.js'

const AI_TIMEOUT_MS = 30_000   // 30 s

export async function getRoadmap(req, res, next) {
  try {
    const roadmap = await dbStore.getRoadmap(req.userId)
    res.json({ success: true, data: roadmap })
  } catch (error) {
    next(error)
  }
}

export async function generateRoadmap(req, res, next) {
  try {
    const profile = await dbStore.getProfile(req.userId)

    let plan = null
    if (process.env.OPENROUTER_API_KEY) {
      plan = await requestOpenRouterRoadmap(profile)
    }

    if (!plan) {
      plan = createLocalRoadmap(profile)
    }

    const saved = await dbStore.saveRoadmap(req.userId, plan)

    // Auto-generate tasks for today matching this new roadmap
    const defaultTasks = [
      { type: 'Learn',    title: `Learn core basics for ${profile.skills?.[0] || 'your goal'}`,     detail: 'Go through recommended introductory documentation or tutorial',         duration: '45 min' },
      { type: 'Practice', title: 'Set up environment & practice basic syntax',                        detail: 'Write 3 simple scripts/programs locally',                               duration: '60 min' },
      { type: 'Career',   title: `Research top 3 internship requirements for ${profile.goal}`,        detail: 'List skills and technologies mentioned in job listings',                 duration: '30 min' },
    ]
    const today = new Date().toISOString().split('T')[0]
    await dbStore.saveTasks(req.userId, today, defaultTasks)

    res.json({ success: true, data: saved })
  } catch (error) {
    next(error)
  }
}

// ── OpenRouter helper with AbortController timeout ────────────────────────────

async function requestOpenRouterRoadmap(profile) {
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
          {
            role:    'system',
            content: `You are AI Life OS, an expert career counselor.
Generate a structured roadmap for a student.
Format must be valid JSON with this exact schema:
{
  "plan30": { "skills": ["skill1", "skill2"], "resources": ["resource1"], "projects": ["project1"] },
  "plan90": { "goals": ["goal1"], "projects": ["project1"] },
  "plan180": { "prep": ["prep1"], "readiness": ["ready1"] }
}`,
          },
          {
            role:    'user',
            content: `Generate roadmap for student: ${JSON.stringify(profile)}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.warn(`OpenRouter roadmap returned ${response.status} — falling back`)
      return null
    }

    const resData = await response.json()
    const content = resData.choices?.[0]?.message?.content
    return JSON.parse(content)
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('OpenRouter roadmap timed out after 30 s — falling back')
    } else {
      console.error('Failed calling OpenRouter for roadmap:', err.message)
    }
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ── Local fallback ────────────────────────────────────────────────────────────

function createLocalRoadmap(profile) {
  const goal = (profile.goal || 'Software Internship').toLowerCase()

  if (
    goal.includes('web') ||
    goal.includes('frontend') ||
    goal.includes('fullstack') ||
    goal.includes('software')
  ) {
    return {
      plan30: {
        skills:    ['Modern JavaScript/ES6 fundamentals', 'HTML5 Semantic Structure & CSS3 layout (Flexbox/Grid)', 'Git version control & basic command line'],
        resources: ['MDN Web Docs (Javascript section)', 'freeCodeCamp - Responsive Web Design Course', 'The Odin Project - Foundation path'],
        projects:  ['Responsive portfolio showcase website', 'Dynamic calculator or task tracker dashboard'],
      },
      plan90: {
        goals:    ['Master React.js (Hooks, state, router)', 'Learn TailwindCSS & UI components library', 'Practice 2 DSA problems on Leetcode every day'],
        projects: ['Weather application using external fetch API', 'Complete ecommerce shopping cart with local state storage'],
      },
      plan180: {
        prep:      ['Rewrite professional resume targeting entry-level developer roles', 'Complete 5 mock system design/behavioral interviews', 'Contribute a pull request to a public repository'],
        readiness: ['Apply to 15+ relevant internships', 'Publish 3 project case studies on LinkedIn'],
      },
    }
  }

  const skills = profile.skills || []
  return {
    plan30: {
      skills:    [`Foundational learning in ${skills[0] || 'core technologies'}`, 'Intro to command line & basic scripting', 'Understanding industry workflows'],
      resources: ['YouTube crash courses', 'Official reference documentation', 'Github starter repos'],
      projects:  ['Basic CLI command line tools', 'Interactive personal homepage site'],
    },
    plan90: {
      goals:    ['Deep-dive intermediate concepts', 'Build a secondary larger project', 'Start daily technical challenge problems'],
      projects: ['Full-stack CRUD interface', 'Custom automation scripts'],
    },
    plan180: {
      prep:      ['Build resume matching goals', 'Practise standard interview questions', 'Prepare developer profiles'],
      readiness: ['Active outreach to recruiters', 'Submit 10+ software applications'],
    },
  }
}
