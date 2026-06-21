function ProgressRail({ completion, tasks }) {
  const completed = tasks.filter((task) => task.done).length

  return (
    <aside className="hidden w-[300px] shrink-0 border-l border-line bg-white px-7 py-9 xl:block">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">This week</p>
      <div className="mt-5 flex items-center gap-5">
        <ProgressRing value={completion} />
        <div>
          <p className="font-display text-xl font-bold">{completed} {completed === 1 ? 'task' : 'tasks'} done</p>
          <p className="mt-1 text-xs leading-5 text-muted">Complete two more to stay on pace.</p>
        </div>
      </div>

      <div className="mt-10 border-t border-line pt-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">Your path</p>
            <h2 className="mt-2 font-display text-xl font-bold">Software internship</h2>
          </div>
          <span className="rounded-full bg-indigo-soft px-2.5 py-1 text-[10px] font-bold text-indigo">On track</span>
        </div>

        <div className="relative mt-7 space-y-7 pl-9">
          <div className="absolute bottom-5 left-[11px] top-3 w-px bg-line" />
          <Milestone active label="30 days" title="Foundation" detail="JavaScript basics + first web project" />
          <Milestone label="90 days" title="Portfolio" detail="Two projects + consistent DSA practice" />
          <Milestone label="6 months" title="Internship ready" detail="Resume, applications, and interview prep" />
        </div>
      </div>

      <div className="mt-10 rounded-2xl bg-surface p-4">
        <p className="text-xs font-bold text-ink">Next milestone</p>
        <p className="mt-2 text-sm leading-6 text-muted">Publish your first responsive project by 14 July.</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[28%] rounded-full bg-coral" /></div>
        <p className="mt-2 text-[11px] font-semibold text-muted">8 of 30 days</p>
      </div>
    </aside>
  )
}

function ProgressRing({ value }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="relative size-20 shrink-0">
      <svg className="-rotate-90 size-20" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e7eaf2" strokeWidth="7" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#5b5ce2" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-extrabold">{value}%</span>
    </div>
  )
}

function Milestone({ active = false, label, title, detail }) {
  return (
    <div className="relative">
      <span className={`absolute -left-9 top-1 grid size-[23px] place-items-center rounded-full border-4 border-white ${active ? 'bg-indigo' : 'bg-slate-300'}`}>
        {active && <span className="size-1.5 rounded-full bg-white" />}
      </span>
      <p className={`text-[10px] font-extrabold uppercase tracking-[0.14em] ${active ? 'text-indigo' : 'text-muted'}`}>{label}</p>
      <h3 className="mt-1 text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted">{detail}</p>
    </div>
  )
}

export default ProgressRail
