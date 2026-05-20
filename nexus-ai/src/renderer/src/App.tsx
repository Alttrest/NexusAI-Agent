import { useEffect, useState } from 'react'
import { useAppStore } from './stores/app.store'
import Shell from './components/layout/Shell'
import SetupWizard from './pages/SetupWizard'
import ChatMode from './pages/ChatMode'
import StudioMode from './pages/StudioMode'
import CodeMode from './pages/CodeMode'
import LearnMode from './pages/LearnMode'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { mode, setupCompleted, setSetupCompleted, setTheme } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const completed = await window.nexusAPI.settings.get('setupCompleted')
        if (completed) setSetupCompleted(true)
        document.body.classList.add('dark')
      } catch (e) {
        console.error('Init error:', e)
      }
      setLoading(false)
    }
    init()
  }, [])

  // Loading screen
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg-deep)' }}>
        <div className="text-center animate-fade-in">
          <div className="loading-orb mx-auto mb-4" />
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Initializing...</p>
        </div>
      </div>
    )
  }

  // Setup wizard on first launch
  if (!setupCompleted) {
    return <SetupWizard />
  }

  // Main app
  const renderMode = () => {
    switch (mode) {
      case 'chat': return <ChatMode />
      case 'studio': return <StudioMode />
      case 'code': return <CodeMode />
      case 'learn': return <LearnMode />
      case 'settings' as any: return <SettingsPage />
      default: return <ChatMode />
    }
  }

  return (
    <Shell>
      {renderMode()}
    </Shell>
  )
}
