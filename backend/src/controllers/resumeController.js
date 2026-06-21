import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const AI_TIMEOUT_MS = 30_000

export async function analyzeResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a PDF resume file' })
    }

    const buffer = req.file.buffer
    let text = ''
    try {
      const parsed = await pdfParse(buffer)
      text = parsed.text || ''
    } catch (err) {
      console.error('Error parsing PDF, using raw buffer fallback:', err)
      text = buffer.toString('utf-8')
    }

    let analysis = null
    if (process.env.OPENROUTER_API_KEY) {
      analysis = await requestOpenRouterAnalysis(text)
    }

    if (!analysis) {
      analysis = createLocalAnalysis(text)
    }

    res.json({ success: true, data: analysis })
  } catch (error) {
    next(error)
  }
}

// ── OpenRouter helper with AbortController timeout ────────────────────────────

async function requestOpenRouterAnalysis(text) {
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
            content: `You are a professional resume parser and ATS analyzer.
Analyze the following resume text and score it (out of 100).
Check for missing sections: "Education", "Experience", "Projects", "Skills", "Certifications".
Provide clear actionable suggestions.
Format must be valid JSON with this exact schema:
{
  "score": 75,
  "missingSections": ["Certifications"],
  "suggestions": ["Add links to your github projects", "Include metrics/impact in your project descriptions"]
}`,
          },
          {
            role:    'user',
            content: `Analyze this resume text:\n\n${text.substring(0, 4000)}`,
          },
        ],
      }),
    })

    if (!response.ok) return null

    const resData = await response.json()
    const content = resData.choices?.[0]?.message?.content
    return JSON.parse(content)
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('OpenRouter resume analysis timed out — falling back to local analysis')
    } else {
      console.error('Failed calling OpenRouter for resume review:', err.message)
    }
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ── Local fallback ────────────────────────────────────────────────────────────

function createLocalAnalysis(text) {
  const norm = text.toLowerCase()

  const sectionsToCheck = [
    { name: 'Education',       keywords: ['education', 'university', 'college', 'school', 'degree', 'b.tech', 'btech', 'gpa'] },
    { name: 'Experience',      keywords: ['experience', 'work', 'employment', 'intern', 'job', 'position', 'internship'] },
    { name: 'Projects',        keywords: ['projects', 'personal projects', 'key projects', 'github', 'portfolio'] },
    { name: 'Skills',          keywords: ['skills', 'technical skills', 'technologies', 'proficiencies', 'languages', 'tools'] },
    { name: 'Certifications',  keywords: ['certifications', 'certification', 'certificates', 'courses'] },
  ]

  const missingSections = []
  let detectedSectionsCount = 0

  for (const sec of sectionsToCheck) {
    const found = sec.keywords.some(kw => norm.includes(kw))
    if (!found) missingSections.push(sec.name)
    else detectedSectionsCount++
  }

  let score = 30 + detectedSectionsCount * 10
  if (norm.includes('github.com'))   score += 10
  if (norm.includes('linkedin.com')) score += 10
  score = Math.min(score, 100)

  const suggestions = []

  if (missingSections.includes('Projects')) {
    suggestions.push('Add a dedicated "Projects" section to showcase practical applications of your technical skills.')
  } else if (!norm.includes('github.com')) {
    suggestions.push('Add active GitHub links to your projects so hiring managers can verify your source code quality.')
  }

  if (missingSections.includes('Experience')) {
    suggestions.push('Add an "Experience" or "Internships" section. If you lack commercial experience, list open-source contributions or volunteering.')
  }

  if (missingSections.includes('Certifications')) {
    suggestions.push('Add a "Certifications" or "Courses" section to list relevant online accomplishments (e.g., Coursera, Udemy).')
  }

  if (suggestions.length === 0) {
    suggestions.push('Quantify the achievements in your projects (e.g., "reduced latency by 20%" or "created 5 distinct REST endpoints").')
    suggestions.push('Tailor your skills section to specifically match standard keywords of target roles (e.g., "REST APIs", "Node.js").')
  }

  return { score, missingSections, suggestions }
}
