import { useState, useEffect } from 'react'
import { Play, Square, Crosshair, AlertCircle, Loader2 } from 'lucide-react'
import { useChatStore } from '../stores/chat.store'

interface LessonStep {
  step: string
  x?: number
  y?: number
  action: 'click' | 'type' | 'scroll' | 'wait'
  details?: string
}

export default function LearnMode() {
  const { selectedModel } = useChatStore()
  const [task, setTask] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<LessonStep | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (isActive) {
        window.nexusAPI.learn.stopSession()
      }
    }
  }, [isActive])

  const handleStart = async () => {
    if (!task.trim()) return
    setError(null)
    setIsActive(true)
    setIsProcessing(true)

    try {
      const resSession = await window.nexusAPI.learn.startSession()
      if (!resSession.success) throw new Error(resSession.error)

      await processNextStep()
    } catch (err: any) {
      setError(err.message)
      handleStop()
    }
  }

  const processNextStep = async () => {
    try {
      setIsProcessing(true)
      setCurrentStep(null)

      const captureRes = await window.nexusAPI.learn.captureScreen()
      if (!captureRes.success) throw new Error(captureRes.error)

      const visionRes = await window.nexusAPI.learn.sendVision(captureRes.data, task, selectedModel)
      if (!visionRes.success) throw new Error(visionRes.error)

      let steps: LessonStep[] = []
      try {
        const jsonMatch = visionRes.data.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          steps = JSON.parse(jsonMatch[0])
        } else {
          steps = JSON.parse(visionRes.data)
        }
      } catch (e) {
        throw new Error('Failed to parse model response. Ensure the model supports vision and outputs JSON.')
      }

      if (steps.length > 0) {
        const nextStep = steps[0]
        setCurrentStep(nextStep)
        
        if (nextStep.x !== undefined && nextStep.y !== undefined) {
          await window.nexusAPI.learn.showDot(nextStep.x, nextStep.y)
        } else {
          await window.nexusAPI.learn.hideDot()
        }
      } else {
        setCurrentStep({ step: 'Task completed or no further steps found.', action: 'wait' })
        await window.nexusAPI.learn.hideDot()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStop = async () => {
    setIsActive(false)
    setIsProcessing(false)
    setCurrentStep(null)
    await window.nexusAPI.learn.stopSession()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b"
        style={{ borderColor: 'var(--color-glass-border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Learn</h2>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,255,130,0.1)', color: 'var(--color-neon-green)', border: '1px solid rgba(0,255,130,0.2)' }}>
          Vision Guidance
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-2xl glass-strong p-8 relative overflow-hidden">
          {/* Animated Background */}
          {isActive && (
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% -20%, var(--color-neon-green) 0%, transparent 60%)' }} />
          )}

          <div className="text-center relative z-10">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'animate-pulse-glow' : 'animate-float'}`}
              style={{ background: 'rgba(0,255,130,0.08)', border: '1px solid rgba(0,255,130,0.15)' }}>
              <Crosshair size={36} style={{ color: 'var(--color-neon-green)' }} />
            </div>

            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Interactive Screen Guidance
            </h1>
            
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
              Describe what you want to do. NexusAI will analyze your screen and project a glowing dot exactly where you need to click.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl flex flex-col items-center gap-2 text-red-400 text-sm"
                style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)' }}>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
                {error.includes('parse') && (
                  <p className="text-xs opacity-80">Make sure your selected model supports Vision (e.g. gpt-4o, claude-3.5-sonnet).</p>
                )}
              </div>
            )}

            {!isActive ? (
              <div className="space-y-4 animate-fade-in">
                <input value={task} onChange={(e) => setTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  placeholder="e.g., How do I change my display resolution?"
                  className="input-glow text-center text-lg py-4 px-6" />
                <button onClick={handleStart}
                  className="btn-neon-solid px-8 py-3 flex items-center gap-2 mx-auto text-base"
                  disabled={!task.trim()}>
                  <Play size={18} /> Start Session
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 rounded-xl border" style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'var(--color-glass-border)' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-neon-green)' }}>
                    Current Objective
                  </h3>
                  <p className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>{task}</p>
                </div>

                <div className="min-h-[100px] flex items-center justify-center">
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="loading-orb" style={{ width: 24, height: 24, background: 'radial-gradient(circle, var(--color-neon-green), rgba(0,255,130,0.2))' }} />
                      <span className="text-sm" style={{ color: 'var(--color-neon-green)' }}>Analyzing screen...</span>
                    </div>
                  ) : currentStep ? (
                    <div className="text-center animate-fade-in">
                      <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-md text-xs font-bold uppercase tracking-wide"
                        style={{ background: 'rgba(0,255,130,0.1)', color: 'var(--color-neon-green)' }}>
                        {currentStep.action}
                      </div>
                      <p className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>{currentStep.step}</p>
                      {currentStep.details && (
                        <p className="text-sm mt-2 opacity-80">{currentStep.details}</p>
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-center gap-3">
                  <button onClick={processNextStep}
                    className="btn-ghost flex items-center gap-2 border" style={{ borderColor: 'var(--color-glass-border)' }}
                    disabled={isProcessing}>
                    <Play size={16} /> Next Step
                  </button>
                  <button onClick={handleStop}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-red-500/20 text-red-400 border border-transparent hover:border-red-500/30">
                    <Square size={16} /> End Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
