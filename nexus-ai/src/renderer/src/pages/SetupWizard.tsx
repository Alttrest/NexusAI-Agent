import { useState } from 'react'
import { Key, Github, GitBranch, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAppStore } from '../stores/app.store'

const steps = ['Authentication', 'Configuration']

export default function SetupWizard() {
  const [step, setStep] = useState(0)
  const [apiKey, setApiKey] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [autoGitCommit, setAutoGitCommit] = useState(true)
  const [saving, setSaving] = useState(false)
  const { setSetupCompleted } = useAppStore()

  const handleNext = () => {
    if (step === 0 && apiKey.trim()) {
      setStep(1)
    }
  }

  const handleComplete = async () => {
    setSaving(true)
    await window.nexusAPI.chat.updateApiKey(apiKey.trim())
    await window.nexusAPI.settings.set('openRouterApiKey', apiKey.trim())
    if (githubToken.trim()) {
      await window.nexusAPI.settings.set('githubToken', githubToken.trim())
    }
    await window.nexusAPI.settings.set('autoGitCommit', autoGitCommit)
    await window.nexusAPI.settings.set('setupCompleted', true)
    
    setSetupCompleted(true)
    setSaving(false)
  }

  return (
    <div className="h-full flex items-center justify-center p-8"
      style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0, 210, 255, 0.03) 0%, transparent 70%)' }}>
      <div className="glass-strong w-full max-w-lg p-8 animate-fade-in">
        {/* Step Dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`wizard-step-dot ${i === step ? 'active' : i < step ? 'completed' : ''}`} />
          ))}
        </div>

        {/* Step 1: Authentication */}
        {step === 0 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
              Authentication
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)' }}>
                    <Key size={16} style={{ color: 'var(--color-neon-cyan)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>OpenRouter API Key (Required)</h3>
                  </div>
                </div>
                <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password"
                  placeholder="sk-or-v1-..." className="input-glow" />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(160,50,255,0.1)', border: '1px solid rgba(160,50,255,0.2)' }}>
                    <Github size={16} style={{ color: 'var(--color-neon-purple)' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>GitHub Token (Optional)</h3>
                  </div>
                </div>
                <input value={githubToken} onChange={(e) => setGithubToken(e.target.value)} type="password"
                  placeholder="ghp_..." className="input-glow" />
              </div>
            </div>

            <button onClick={handleNext} className="btn-neon-solid w-full flex items-center justify-center gap-2 mt-8"
              disabled={!apiKey.trim()}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: Configuration */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>
              Configuration
            </h2>

            <div className="glass-subtle p-5 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch size={20} style={{ color: 'var(--color-neon-green)' }} />
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Auto Git Commit</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Automatically commit changes to Git before the AI modifies any code.
                    </p>
                  </div>
                </div>
                <div className={`toggle-track ${autoGitCommit ? 'active' : ''}`}
                  onClick={() => setAutoGitCommit(!autoGitCommit)}>
                  <div className="toggle-thumb" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(0)} className="btn-ghost flex items-center gap-1">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={handleComplete} className="btn-neon-solid flex-1 flex items-center justify-center gap-2" disabled={saving}>
                {saving ? 'Saving...' : 'Launch NexusAI'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
