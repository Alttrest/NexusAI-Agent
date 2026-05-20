import { useState, useEffect } from 'react'
import { Key, Github, GitBranch, Palette, Save, Check } from 'lucide-react'
import { useAppStore } from '../stores/app.store'

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore()
  const [apiKey, setApiKey] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [autoGitCommit, setAutoGitCommit] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const settings = await window.nexusAPI.settings.getAll()
      if (settings.openRouterApiKey) setApiKey(settings.openRouterApiKey)
      if (settings.githubToken) setGithubToken(settings.githubToken)
      if (settings.autoGitCommit !== undefined) setAutoGitCommit(settings.autoGitCommit)
      if (settings.theme) setTheme(settings.theme)
    }
    load()
  }, [])

  const handleSave = async () => {
    await window.nexusAPI.settings.set('openRouterApiKey', apiKey)
    await window.nexusAPI.settings.set('githubToken', githubToken)
    await window.nexusAPI.settings.set('autoGitCommit', autoGitCommit)
    await window.nexusAPI.settings.set('theme', theme)
    await window.nexusAPI.chat.updateApiKey(apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: 'var(--color-glass-border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Settings</h2>
        <button onClick={handleSave} className="btn-neon flex items-center gap-2 text-xs">
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
        <div className="space-y-6">
          {/* API Key */}
          <div className="glass-subtle p-5">
            <div className="flex items-center gap-3 mb-4">
              <Key size={18} style={{ color: 'var(--color-neon-cyan)' }} />
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>OpenRouter API Key</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Required for all AI operations</p>
              </div>
            </div>
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password"
              placeholder="sk-or-v1-..." className="input-glow" />
          </div>

          {/* GitHub */}
          <div className="glass-subtle p-5">
            <div className="flex items-center gap-3 mb-4">
              <Github size={18} style={{ color: 'var(--color-neon-purple)' }} />
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>GitHub Token</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>For repository management</p>
              </div>
            </div>
            <input value={githubToken} onChange={(e) => setGithubToken(e.target.value)} type="password"
              placeholder="ghp_..." className="input-glow" />
          </div>

          {/* Auto Git Commit */}
          <div className="glass-subtle p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitBranch size={18} style={{ color: 'var(--color-neon-green)' }} />
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Auto Git Commit</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Automatically commit before AI modifies code
                  </p>
                </div>
              </div>
              <div className={`toggle-track ${autoGitCommit ? 'active' : ''}`}
                onClick={() => setAutoGitCommit(!autoGitCommit)}>
                <div className="toggle-thumb" />
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="glass-subtle p-5">
            <div className="flex items-center gap-3 mb-4">
              <Palette size={18} style={{ color: 'var(--color-neon-magenta)' }} />
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Theme</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Choose your interface style</p>
              </div>
            </div>
            <div className="flex gap-3">
              {(['dark', 'light'] as const).map((t) => (
                <button key={t} onClick={() => setTheme(t)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all capitalize"
                  style={{
                    background: theme === t ? 'rgba(0,210,255,0.1)' : 'transparent',
                    border: `1px solid ${theme === t ? 'rgba(0,210,255,0.3)' : 'var(--color-glass-border)'}`,
                    color: theme === t ? 'var(--color-neon-cyan)' : 'var(--color-text-secondary)',
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
