import { useState } from 'react'

function RoadmapView({ roadmap, onGenerate, profile }) {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    try {
      await onGenerate()
    } catch (err) {
      setError(err.message || 'Roadmap generation failed')
    } finally {
      setGenerating(false)
    }
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="grid size-16 place-items-center rounded-3xl bg-indigo-soft text-indigo mb-6">
          <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="6" r="2" />
            <path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h1" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight">No roadmap generated yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Generate a custom learning roadmap aligned to your profile, interests, and target goal.
        </p>
        {error && <p className="mt-4 text-xs font-semibold text-coral">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-6 rounded-2xl bg-indigo px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-indigo-dark transition disabled:opacity-50"
        >
          {generating ? 'Generating your roadmap...' : 'Generate AI Roadmap'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Your Custom Career Roadmap</h2>
          <p className="text-sm text-muted mt-1">Goal: {profile?.goal || 'Software Internship'}</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-xs font-semibold hover:bg-surface transition disabled:opacity-50"
        >
          {generating ? 'Regenerating...' : 'Regenerate Roadmap'}
        </button>
      </div>

      {error && <p className="text-xs font-semibold text-coral">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 30 Day Plan */}
        <div className="rounded-3xl border border-line bg-white p-6 shadow-panel space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo bg-indigo-soft px-2.5 py-1 rounded-full">Phase 1</span>
            <span className="text-xs text-muted font-bold">30 Days</span>
          </div>
          <h3 className="font-display text-lg font-bold">Foundation Building</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Skills to learn</p>
              <ul className="mt-2 space-y-1.5 text-xs text-ink list-disc list-inside">
                {roadmap.plan30?.skills?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Recommended Resources</p>
              <ul className="mt-2 space-y-1.5 text-xs text-indigo list-disc list-inside font-medium">
                {roadmap.plan30?.resources?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Core Projects</p>
              <ul className="mt-2 space-y-1.5 text-xs text-ink list-disc list-inside">
                {roadmap.plan30?.projects?.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 90 Day Plan */}
        <div className="rounded-3xl border border-line bg-white p-6 shadow-panel space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-coral bg-coral/10 px-2.5 py-1 rounded-full">Phase 2</span>
            <span className="text-xs text-muted font-bold">90 Days</span>
          </div>
          <h3 className="font-display text-lg font-bold">Portfolio Development</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Intermediate Goals</p>
              <ul className="mt-2 space-y-1.5 text-xs text-ink list-disc list-inside">
                {roadmap.plan90?.goals?.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Projects to Ship</p>
              <ul className="mt-2 space-y-1.5 text-xs text-ink list-disc list-inside">
                {roadmap.plan90?.projects?.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 6 Month Plan */}
        <div className="rounded-3xl border border-line bg-white p-6 shadow-panel space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-success bg-success/10 px-2.5 py-1 rounded-full">Phase 3</span>
            <span className="text-xs text-muted font-bold">180 Days</span>
          </div>
          <h3 className="font-display text-lg font-bold">Internship Readiness</h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Interview Preparation</p>
              <ul className="mt-2 space-y-1.5 text-xs text-ink list-disc list-inside">
                {roadmap.plan180?.prep?.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Applications & Outreach</p>
              <ul className="mt-2 space-y-1.5 text-xs text-ink list-disc list-inside">
                {roadmap.plan180?.readiness?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoadmapView
