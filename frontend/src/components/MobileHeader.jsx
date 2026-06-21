function MobileHeader({ onOpen }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-indigo font-display font-bold text-white">A</span>
        <span className="font-display font-bold">AI Life OS</span>
      </div>
      <button className="rounded-lg border border-line p-2 text-ink focus:outline-none focus:ring-2 focus:ring-indigo" onClick={onOpen} aria-label="Open navigation">
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
    </header>
  )
}

export default MobileHeader
