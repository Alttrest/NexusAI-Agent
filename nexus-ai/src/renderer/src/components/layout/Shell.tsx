import TopBar from './TopBar'
import Sidebar from './Sidebar'
import { useAppStore } from '../../stores/app.store'

interface ShellProps {
  children: React.ReactNode
}

export default function Shell({ children }: ShellProps) {
  const { theme } = useAppStore()

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${theme === 'light' ? 'theme-light' : ''}`}
      style={{ background: 'var(--color-bg-deep)' }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
