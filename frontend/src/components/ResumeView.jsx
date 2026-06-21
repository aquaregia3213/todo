import { useState } from 'react'
import { analyzeResume } from '../lib/api'

function ResumeView() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) {
      setError('Please choose a file to upload first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await analyzeResume(file)
      setResult(res)
    } catch (err) {
      setError(err.message || 'An error occurred during resume analysis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">AI Resume Analyzer</h2>
        <p className="text-sm text-muted mt-1">Upload your resume PDF to see your ATS readability score, missing sections, and improvement points.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload form card */}
        <div className="rounded-3xl border border-line bg-white p-6 shadow-panel lg:col-span-1 h-fit space-y-4">
          <h3 className="font-display text-base font-bold">Upload Resume</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-line rounded-2xl p-6 bg-surface/30 hover:bg-surface/50 transition cursor-pointer relative">
              <input
                type="file"
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <svg className="size-8 text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <p className="text-xs font-semibold text-ink text-center">
                {file ? file.name : 'Choose PDF file'}
              </p>
              <p className="text-[10px] text-muted mt-1">PDF format only (Max 5MB)</p>
            </div>

            {error && <p className="text-xs font-semibold text-coral">{error}</p>}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full rounded-xl bg-indigo py-2.5 text-sm font-semibold text-white hover:bg-indigo-dark disabled:opacity-50 transition"
            >
              {loading ? 'Analyzing your resume...' : 'Analyze Resume'}
            </button>
          </form>
        </div>

        {/* Results layout */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-line rounded-3xl shadow-panel">
              <div className="size-10 rounded-full border-4 border-indigo/20 border-t-indigo animate-spin" />
              <p className="mt-4 text-sm font-semibold text-ink">Parsing PDF and scoring sections...</p>
              <p className="text-xs text-muted mt-1">This takes only a few seconds.</p>
            </div>
          ) : result ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Score card */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-panel flex flex-col items-center text-center space-y-4">
                <h3 className="font-display text-base font-bold w-full text-left">ATS Compatibility</h3>
                <div className="relative size-32">
                  <svg className="-rotate-90 size-32" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e7eaf2" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 - (result.score / 100) * 2 * Math.PI * 40}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-2xl font-extrabold">{result.score}/100</span>
                </div>
                <p className="text-xs text-muted leading-5">
                  {result.score >= 80
                    ? 'Excellent job! Your resume matches the industry standard.'
                    : result.score >= 60
                    ? 'Good starting point. Address the suggestions to increase score.'
                    : 'Critical sections are missing. Follow the guidelines below.'}
                </p>
              </div>

              {/* Missing sections */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-panel space-y-4">
                <h3 className="font-display text-base font-bold">Missing Sections</h3>
                {result.missingSections && result.missingSections.length > 0 ? (
                  <ul className="space-y-2">
                    {result.missingSections.map((sec, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-semibold text-coral">
                        <span className="grid size-5 place-items-center rounded-full bg-coral/10 text-[10px]">!</span>
                        {sec}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-success">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>
                    All primary sections detected!
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-panel md:col-span-2 space-y-4">
                <h3 className="font-display text-base font-bold">Suggestions for Improvement</h3>
                <ul className="space-y-3">
                  {result.suggestions?.map((sug, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs leading-5 text-ink">
                      <span className="grid size-5 place-items-center rounded-full bg-indigo-soft text-indigo text-[10px] shrink-0 font-bold mt-0.5">{i + 1}</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface/20 border border-dashed border-line rounded-3xl text-center">
              <svg className="size-10 text-slate-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              <p className="text-sm font-semibold text-muted">Upload your resume to view ATS readability analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeView
