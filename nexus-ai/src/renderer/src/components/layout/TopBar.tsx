import { Minus, Square, X, Sun, Moon } from 'lucide-react'
import { useAppStore } from '../../stores/app.store'
import ModelSelector from '../shared/ModelSelector'
import logo from '../../../../../logo.png'

export default function TopBar() {
  const { theme, toggleTheme } = useAppStore()

  return (
    <div className="titlebar-drag flex items-center justify-between h-11 px-4 border-b"
      style={{ borderColor: 'var(--color-glass-border)', background: 'var(--color-glass-bg)' }}>
      {/* App Title & Global Model Selector */}
      <div className="titlebar-no-drag flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="NexusAI Logo" className="w-7 h-7 object-contain" />
          <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
            NEXUS<span style={{ color: 'var(--color-neon-cyan)' }}>AI</span>
          </span>
        </div>
        
        <div className="h-4 w-px bg-white/10 mx-2" />
        
        <div className="titlebar-no-drag mt-0.5">
          <ModelSelector />
        </div>
      </div>

      {/* Controls */}
      <div className="titlebar-no-drag flex items-center gap-1">
        <button onClick={() => window.nexusAPI.window.minimize()}
          className="p-1.5 rounded-md transition-colors hover:bg-white/5">
          <Minus size={14} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <button onClick={() => window.nexusAPI.window.maximize()}
          className="p-1.5 rounded-md transition-colors hover:bg-white/5">
          <Square size={12} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
        <button onClick={() => window.nexusAPI.window.close()}
          className="p-1.5 rounded-md transition-colors hover:bg-red-500/20 group">
          <X size={14} className="group-hover:text-red-400" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </div>
  )
}
