import { useEffect, useMemo, useState } from 'react'
import AppSidebar from './components/AppSidebar'
import ChatPanel from './components/ChatPanel'
import DailyPlan from './components/DailyPlan'
import MobileHeader from './components/MobileHeader'
import ProgressRail from './components/ProgressRail'
import RoadmapView from './components/RoadmapView'
import ProgressView from './components/ProgressView'
import ResumeView from './components/ResumeView'
import ProfileModal from './components/ProfileModal'
import Auth from './components/Auth'
import { supabase } from './lib/supabase'
import {
  fetchProfile,
  saveProfile,
  fetchRoadmap,
  generateRoadmap,
  fetchTasks,
  toggleTask,
  fetchProgress,
  sendChatMessage
} from './lib/api'

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: 'You have 7 hours available this week. I turned your software internship goal into three focused actions for today.',
    sections: {
      situation: 'Second-year mechanical engineering student with basic C++ and an early software foundation.',
      path: 'Build JavaScript fundamentals, practice problem solving, then ship one small web project.',
      action: 'Finish today’s three tasks. Start with the 35-minute JavaScript lesson.',
      outcome: 'By Sunday, you will have stronger fundamentals and a sharper internship-ready profile.',
      timeline: 'Today: 1 hr 40 min · First project: 30 days · Internship ready: 6 months',
    },
  },
]

function App() {
  const [session, setSession] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [profile, setProfile] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [tasks, setTasks] = useState([])
  const [progressLogs, setProgressLogs] = useState([])
  const [messages, setMessages] = useState(initialMessages)
  const [activeNav, setActiveNav] = useState('Today')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Listen for authentication changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoadingAuth(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Load all user data when authenticated
  useEffect(() => {
    if (!session) {
      setProfile(null)
      setRoadmap(null)
      setTasks([])
      setProgressLogs([])
      setMessages(initialMessages)
      return
    }

    setLoading(true)
    async function loadData() {
      try {
        const [profData, roadmapData, tasksData, progressData] = await Promise.all([
          fetchProfile(),
          fetchRoadmap(),
          fetchTasks(),
          fetchProgress()
        ])
        setProfile(profData)
        setRoadmap(roadmapData)
        setTasks(tasksData)
        setProgressLogs(progressData)
      } catch (err) {
        console.error('Failed to load initial data:', err)
        setError('Connection to server failed. Using local mockup fallback.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [session])

  const completion = useMemo(() => {
    if (tasks.length === 0) return 0
    const completed = tasks.filter((task) => task.done).length
    return Math.round((completed / tasks.length) * 100)
  }, [tasks])

  async function handleToggleTask(taskId) {
    try {
      await toggleTask(taskId)
      // Refresh tasks and progress log
      const [newTasks, newProgress] = await Promise.all([
        fetchTasks(),
        fetchProgress()
      ])
      setTasks(newTasks)
      setProgressLogs(newProgress)
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  async function handleGenerateRoadmap() {
    const newRoadmap = await generateRoadmap()
    setRoadmap(newRoadmap)
    // Roadmap generation also sets new tasks on backend, so refresh tasks
    const newTasks = await fetchTasks()
    setTasks(newTasks)
  }

  async function handleSaveProfile(newProfile) {
    const saved = await saveProfile(newProfile)
    setProfile(saved)
  }

  async function sendMessage(text) {
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text }])
    setIsSending(true)

    try {
      const response = await sendChatMessage({
        message: text
      })
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: 'assistant', ...response.data },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'I could not reach the coach service. Your plan is still available, so keep moving with the next unfinished task.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  if (loadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="size-8 rounded-full border-4 border-indigo/25 border-t-indigo animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <MobileHeader onOpen={() => setSidebarOpen(true)} />
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <AppSidebar
          activeNav={activeNav}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={setActiveNav}
          profile={profile}
          onEditProfile={() => setIsProfileModalOpen(true)}
        />

        <main className="min-w-0 flex-1 px-5 pb-8 pt-6 sm:px-8 lg:px-10 lg:pt-9">
          <header className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="mb-1 text-sm font-semibold text-indigo">Sunday, 14 June</p>
              <h1 className="font-display text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Good morning, {profile?.name || 'Arjun'}.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                {profile?.goal ? `Your ${profile.goal.toLowerCase()} goal is moving.` : 'Define your goal in edit profile.'} Here is the clearest path for today.
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Today’s focus</p>
              <p className="mt-1 text-sm font-semibold">{tasks.length > 0 ? `${tasks.length} tasks` : 'No tasks'}</p>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="size-8 rounded-full border-4 border-indigo/25 border-t-indigo animate-spin" />
            </div>
          ) : (
            <>
              {activeNav === 'Today' && (
                <div className="space-y-7">
                  <DailyPlan tasks={tasks} onToggle={handleToggleTask} />
                  <ChatPanel messages={messages} isSending={isSending} onSend={sendMessage} />
                </div>
              )}

              {activeNav === 'Roadmap' && (
                <RoadmapView
                  roadmap={roadmap}
                  profile={profile}
                  onGenerate={handleGenerateRoadmap}
                />
              )}

              {activeNav === 'Progress' && (
                <ProgressView progressLogs={progressLogs} />
              )}

              {activeNav === 'Resume' && (
                <ResumeView />
              )}
            </>
          )}
        </main>

        <ProgressRail completion={completion} tasks={tasks} />
      </div>

      {isProfileModalOpen && (
        <ProfileModal
          profile={profile}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}

export default App
