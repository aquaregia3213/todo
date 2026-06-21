import { useEffect, useRef, useState } from 'react'

const quickPrompts = [
  'What should I work on next?',
  'Make this week easier',
  'Suggest a portfolio project',
]

function ChatPanel({ messages, isSending, onSend }) {
  const [input, setInput] = useState('')
  const messagesRef = useRef(null)

  useEffect(() => {
    if (!messagesRef.current) return
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, isSending])

  function submit(event) {
    event?.preventDefault()
    const value = input.trim()
    if (!value || isSending) return
    setInput('')
    onSend(value)
  }

  return (
    <section className="mt-7 overflow-hidden rounded-[24px] border border-line bg-white shadow-panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="relative grid size-10 place-items-center rounded-xl bg-navy text-white">
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 5h14v11H9l-4 4z" />
              <path d="M9 9h6M9 12h4" />
            </svg>
            <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-success" />
          </span>
          <div>
            <h2 className="font-display text-base font-bold">Your career coach</h2>
            <p className="text-xs text-muted">Knows your goal, time, and progress</p>
          </div>
        </div>
        <span className="hidden text-xs font-semibold text-muted sm:block">AI guidance</span>
      </div>

      <div ref={messagesRef} className="chat-scroll max-h-[470px] min-h-[390px] space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
        {messages.map((message) => <Message key={message.id} message={message} />)}
        {isSending && (
          <div className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
            <span className="typing-dot" />
            <span className="typing-dot [animation-delay:140ms]" />
            <span className="typing-dot [animation-delay:280ms]" />
            <span className="ml-1">Building your next step…</span>
          </div>
        )}
      </div>

      <div className="border-t border-line bg-surface/50 px-4 py-4 sm:px-5">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              className="whitespace-nowrap rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-indigo hover:text-indigo focus:outline-none focus:ring-2 focus:ring-indigo"
              onClick={() => onSend(prompt)}
              disabled={isSending}
            >
              {prompt}
            </button>
          ))}
        </div>
        <form className="flex items-end gap-3 rounded-2xl border border-line bg-white p-2 focus-within:border-indigo focus-within:ring-2 focus-within:ring-indigo/10" onSubmit={submit}>
          <textarea
            className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-slate-400"
            rows="1"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit()
              }
            }}
            placeholder="Ask what to work on next…"
            aria-label="Message your career coach"
          />
          <button
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo text-white transition hover:bg-indigo-dark disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo focus:ring-offset-2"
            type="submit"
            disabled={!input.trim() || isSending}
            aria-label="Send message"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 14-7-4 14-3-6z" /></svg>
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted">Plans are guidance. Check course, internship, and hiring details before applying.</p>
      </div>
    </section>
  )
}

function Message({ message }) {
  if (message.role === 'user') {
    return <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-indigo px-4 py-3 text-sm leading-6 text-white sm:max-w-[70%]">{message.text}</div>
  }

  return (
    <div className="max-w-3xl">
      <p className="text-sm leading-6 text-ink">{message.text}</p>
      {message.sections && (
        <div className="mt-4 grid gap-x-5 gap-y-4 border-l-2 border-indigo/25 pl-4 sm:grid-cols-2">
          <CoachSection label="Current situation" value={message.sections.situation} />
          <CoachSection label="Recommended path" value={message.sections.path} />
          <CoachSection label="Next action" value={message.sections.action} emphasis />
          <CoachSection label="Expected outcome" value={message.sections.outcome} />
          <div className="sm:col-span-2"><CoachSection label="Timeline" value={message.sections.timeline} /></div>
        </div>
      )}
    </div>
  )
}

function CoachSection({ label, value, emphasis = false }) {
  return (
    <div className={emphasis ? 'rounded-xl bg-indigo-soft p-3' : ''}>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{value}</p>
    </div>
  )
}

export default ChatPanel
