import { useState } from 'react'

function ProfileModal({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    degree: profile?.degree || '',
    branch: profile?.branch || '',
    year: profile?.year || '',
    skills: profile?.skills?.join(', ') || '',
    interests: profile?.interests?.join(', ') || '',
    goal: profile?.goal || '',
    budget: profile?.budget || '',
    weeklyTime: profile?.weeklyTime || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
      }
      await onSave(payload)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-white p-6 shadow-panel">
        <button
          className="absolute right-5 top-5 text-2xl text-muted hover:text-ink transition"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="font-display text-xl font-bold tracking-tight">Edit profile details</h2>
        <p className="mt-1 text-xs text-muted mb-5">Keep your details fresh so the AI coach can customize your roadmaps.</p>

        {error && <p className="mb-4 text-xs font-semibold text-coral">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Full Name</label>
              <input
                type="text"
                required
                className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Degree</label>
              <input
                type="text"
                required
                placeholder="e.g. B.Tech"
                className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
                value={formData.degree}
                onChange={e => setFormData({ ...formData, degree: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Branch / Major</label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science"
                className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Current Year</label>
              <input
                type="text"
                required
                placeholder="e.g. Second year"
                className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Skills (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Python, basic HTML, SQL"
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Interests (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Web Development, AI, DevOps"
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
              value={formData.interests}
              onChange={e => setFormData({ ...formData, interests: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Career Goal</label>
            <input
              type="text"
              required
              placeholder="e.g. Get a software developer internship"
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
              value={formData.goal}
              onChange={e => setFormData({ ...formData, goal: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Learning Budget</label>
              <input
                type="text"
                placeholder="e.g. ₹5,000"
                className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-muted">Weekly Available Time</label>
              <input
                type="text"
                placeholder="e.g. 10 hours"
                className="mt-1.5 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-indigo"
                value={formData.weeklyTime}
                onChange={e => setFormData({ ...formData, weeklyTime: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted hover:bg-surface transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-dark disabled:opacity-50 transition"
            >
              {submitting ? 'Saving...' : 'Save details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileModal
