import { useMemo } from 'react'

function ProgressView({ progressLogs = [] }) {
  // Sort logs by date ascending
  const sortedLogs = useMemo(() => {
    return [...progressLogs].sort((a, b) => a.date.localeCompare(b.date))
  }, [progressLogs])

  const completionStats = useMemo(() => {
    if (sortedLogs.length === 0) return { completed: 0, total: 0, percentage: 0 }
    let completed = 0
    let total = 0
    for (const log of sortedLogs) {
      completed += log.completedTasksCount || 0
      total += log.totalTasksCount || 0
    }
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [sortedLogs])

  // Calculate local streak
  const streak = useMemo(() => {
    if (sortedLogs.length === 0) return 0
    // Simple contiguous check from today backwards
    let streakCount = 0
    const reversed = [...sortedLogs].reverse()
    for (const log of reversed) {
      if (log.completedTasksCount > 0) {
        streakCount++
      } else {
        break
      }
    }
    return streakCount
  }, [sortedLogs])

  // SVG Chart Dimensions
  const chartWidth = 500
  const chartHeight = 200
  const barPadding = 12

  const bars = useMemo(() => {
    if (sortedLogs.length === 0) return []
    // Take last 7 days
    const last7 = sortedLogs.slice(-7)
    const maxVal = Math.max(...last7.map(l => l.totalTasksCount), 1)
    const numBars = last7.length
    const colWidth = (chartWidth - (numBars - 1) * barPadding) / numBars

    return last7.map((log, index) => {
      const pct = log.completedTasksCount / maxVal
      const barHeight = pct * (chartHeight - 40)
      const x = index * (colWidth + barPadding)
      const y = chartHeight - 30 - barHeight
      
      const totalPct = log.totalTasksCount / maxVal
      const backgroundHeight = totalPct * (chartHeight - 40)
      const bgY = chartHeight - 30 - backgroundHeight

      // Format date to local label
      let label = ''
      try {
        const parts = log.date.split('-')
        label = `${parts[2]}/${parts[1]}`
      } catch {
        label = log.date
      }

      return {
        x,
        y,
        width: colWidth,
        height: Math.max(barHeight, 2), // min height
        bgY,
        bgHeight: Math.max(backgroundHeight, 2),
        label,
        completed: log.completedTasksCount,
        total: log.totalTasksCount
      }
    })
  }, [sortedLogs])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Your Progress & Streak</h2>
        <p className="text-sm text-muted mt-1">Consistency builds skills. Keep your streak active.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Streak card */}
        <div className="rounded-3xl bg-navy p-6 text-white shadow-panel space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Daily Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-extrabold">{streak}</span>
            <span className="text-sm font-semibold text-blue-100">days active</span>
          </div>
          <p className="text-xs text-slate-300">
            {streak > 0 ? 'Amazing job! Do one task today to extend your streak.' : 'Complete your first task today to start a streak.'}
          </p>
        </div>

        {/* Total Tasks card */}
        <div className="rounded-3xl border border-line bg-white p-6 shadow-panel space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Tasks Completed</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-extrabold text-ink">{completionStats.completed}</span>
            <span className="text-sm font-semibold text-muted">of {completionStats.total} total</span>
          </div>
          <p className="text-xs text-muted">
            Lifetime completion average is {completionStats.percentage}%.
          </p>
        </div>

        {/* Growth Rate card */}
        <div className="rounded-3xl border border-line bg-white p-6 shadow-panel space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-muted">Overall average</p>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl font-extrabold text-indigo">{completionStats.percentage}%</span>
            <span className="text-sm font-semibold text-indigo">completion</span>
          </div>
          <p className="text-xs text-muted">Target average for optimal learning speed is 80%+.</p>
        </div>
      </div>

      {/* Activity Chart Section */}
      <div className="rounded-3xl border border-line bg-white p-6 shadow-panel space-y-4">
        <h3 className="font-display text-base font-bold">Daily Activity (Last 7 Days)</h3>
        {bars.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            No activity logged yet. Finish tasks to populate the activity chart.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-2xl mx-auto h-52">
              {/* Background grid lines */}
              <line x1="0" y1="30" x2={chartWidth} y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1={chartHeight - 30} x2={chartWidth} y2={chartHeight - 30} stroke="#cbd5e1" strokeWidth="1" />

              {/* Bars */}
              {bars.map((bar, i) => (
                <g key={i}>
                  {/* Total task height background */}
                  <rect
                    x={bar.x}
                    y={bar.bgY}
                    width={bar.width}
                    height={bar.bgHeight}
                    rx="4"
                    fill="#e2e8f0"
                  />
                  {/* Completed task overlay */}
                  <rect
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    rx="4"
                    fill="#5b5ce2"
                  />
                  {/* Text values */}
                  <text
                    x={bar.x + bar.width / 2}
                    y={bar.y - 6}
                    textAnchor="middle"
                    className="text-[9px] font-extrabold fill-indigo"
                  >
                    {bar.completed}/{bar.total}
                  </text>
                  {/* X Axis Labels */}
                  <text
                    x={bar.x + bar.width / 2}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-slate-400"
                  >
                    {bar.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressView
