import { MessageSquare, Image, Code2, GraduationCap, Settings, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useAppStore } from '../../stores/app.store'

const modes = [
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { id: 'studio' as const, label: 'Studio', icon: Image },
  { id: 'code' as const, label: 'Code', icon: Code2 },
  { id: 'learn' as const, label: 'Learn', icon: GraduationCap },
]

export default function Sidebar() {
  const { mode, setMode, sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <div className="flex flex-col h-full transition-all duration-300 border-r"
      style={{
        width: sidebarCollapsed ? 60 : 200,
        borderColor: 'var(--color-glass-border)',
        background: 'rgba(5, 5, 20, 0.5)',
      }}>
      {/* Collapse Toggle */}
      <div className="flex items-center justify-end p-2">
        <button onClick={toggleSidebar}
          className="p-1.5 rounded-md transition-colors hover:bg-white/5">
          {sidebarCollapsed
            ? <PanelLeft size={16} style={{ color: 'var(--color-text-muted)' }} />
            : <PanelLeftClose size={16} style={{ color: 'var(--color-text-muted)' }} />}
        </button>
      </div>

      {/* Mode Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {modes.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`sidebar-item ${mode === id ? 'active' : ''}`}
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            <Icon size={18} />
            {!sidebarCollapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Settings at Bottom */}
      <div className="px-2 pb-3">
        <div className="w-full h-px mb-2" style={{ background: 'var(--color-glass-border)' }} />
        <button onClick={() => setMode('settings' as any)}
          className={`sidebar-item w-full ${mode === ('settings' as any) ? 'active' : ''}`}
          style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
          id="settings-nav-button">
          <Settings size={18} />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>
      </div>
    </div>
  )
}
