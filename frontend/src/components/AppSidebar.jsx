import { supabase } from '../lib/supabase'

const navItems = [
  { label: 'Today', icon: 'sun' },
  { label: 'Roadmap', icon: 'route' },
  { label: 'Progress', icon: 'chart' },
  { label: 'Resume', icon: 'file' },
]

function AppSidebar({ activeNav, isOpen, onClose, onNavigate, profile, onEditProfile }) {
  return (
    <>
      {isOpen && <button className="fixed inset-0 z-30 bg-ink/30 lg:hidden" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-white px-4 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-indigo text-white shadow-soft">
              <span className="font-display text-base font-extrabold">A</span>
            </div>
            <div>
              <p className="font-display text-base font-bold tracking-tight">AI Life OS</p>
              <p className="text-[11px] font-medium text-muted">Career workspace</p>
            </div>
          </div>
          <button className="rounded-lg p-2 text-muted hover:bg-surface lg:hidden" onClick={onClose} aria-label="Close navigation">×</button>
        </div>

        <nav className="mt-10 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = item.label === activeNav
            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? 'bg-indigo-soft text-indigo' : 'text-muted hover:bg-surface hover:text-ink'}`}
                onClick={() => {
                  onNavigate(item.label)
                  onClose()
                }}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-navy p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-200">Weekly streak</p>
          <p className="mt-2 font-display text-3xl font-bold">6 days</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">One focused session today keeps your best streak alive.</p>
        </div>

        <div className="mt-4 border-t border-line pt-4 flex flex-col gap-1">
          <button
            className="flex items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface w-full"
            onClick={onEditProfile}
          >
            <span className="grid size-9 place-items-center rounded-full bg-coral text-sm font-bold text-white shrink-0">
              {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AJ'}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold truncate max-w-[120px]">{profile?.name || 'Arjun'}</span>
              <span className="block text-xs text-muted">Edit profile</span>
            </span>
          </button>

          <button
            className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-coral-soft text-coral w-full font-semibold text-xs transition"
            onClick={async () => {
              await supabase.auth.signOut()
            }}
          >
            <svg className="size-[16px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

function NavIcon({ name }) {
  const paths = {
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></>,
    route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h1" /></>,
    chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
    file: <><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v5h5M9 13h6M9 17h5" /></>,
  }
  return (
    <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export default AppSidebar
