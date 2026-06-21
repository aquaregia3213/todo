function DailyPlan({ tasks, onToggle }) {
  return (
    <section aria-labelledby="daily-plan-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="daily-plan-title" className="font-display text-lg font-bold">Today’s plan</h2>
        <span className="text-xs font-semibold text-muted">{tasks.filter((task) => task.done).length} of {tasks.length} done</span>
      </div>
      <div className="relative grid gap-3 md:grid-cols-3">
        <div className="path-line absolute left-[16%] right-[16%] top-7 hidden h-px md:block" />
        {tasks.map((task, index) => (
          <article key={task.id} className={`relative rounded-2xl border p-4 transition ${task.done ? 'border-indigo/20 bg-indigo-soft/60' : 'border-line bg-white hover:border-indigo/30'}`}>
            <div className="flex items-start gap-3">
              <button
                className={`relative z-10 mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-indigo focus:ring-offset-2 ${task.done ? 'border-indigo bg-indigo text-white' : 'border-slate-300 bg-white text-transparent hover:border-indigo'}`}
                onClick={() => onToggle(task.id)}
                aria-label={`${task.done ? 'Mark incomplete' : 'Complete'}: ${task.title}`}
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>
              </button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo">{task.type}</span>
                  <span className="text-[11px] font-medium text-muted">{task.duration}</span>
                </div>
                <h3 className={`mt-1 text-sm font-bold ${task.done ? 'text-muted line-through' : ''}`}>{index + 1}. {task.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted">{task.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DailyPlan
