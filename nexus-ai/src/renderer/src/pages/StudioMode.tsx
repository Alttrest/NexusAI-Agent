import { useState } from 'react'
import { ImagePlus, Sparkles, X } from 'lucide-react'
import { useChatStore } from '../stores/chat.store'

interface GeneratedMedia {
  id: string
  type: 'image' | 'text'
  url: string | null
  content: string | null
  prompt: string
  timestamp: number
}

export default function StudioMode() {
  const { selectedModel } = useChatStore()
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [media, setMedia] = useState<GeneratedMedia[]>([])
  const [lightbox, setLightbox] = useState<GeneratedMedia | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    
    try {
      const res = await window.nexusAPI.studio.generate(prompt.trim(), selectedModel)
      if (res.success && res.data) {
        const item: GeneratedMedia = {
          id: Date.now().toString(36),
          type: res.data.type,
          url: res.data.url,
          content: res.data.content,
          prompt: prompt.trim(),
          timestamp: Date.now(),
        }
        setMedia((prev) => [item, ...prev])
      } else {
        alert(res.error || 'Failed to generate image.')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setGenerating(false)
      setPrompt('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b"
        style={{ borderColor: 'var(--color-glass-border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Studio</h2>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,50,180,0.1)', color: 'var(--color-neon-magenta)', border: '1px solid rgba(255,50,180,0.2)' }}>
          Visual / Audio
        </span>
      </div>

      {/* Prompt Bar */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-glass-border)' }}>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe what you want to generate..."
              className="input-glow pr-10" disabled={generating} />
            <ImagePlus size={16} className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <button onClick={handleGenerate} className="btn-neon-solid flex items-center gap-2 px-6"
            disabled={!prompt.trim() || generating}>
            {generating ? (
              <><div className="loading-orb" style={{ width: 16, height: 16 }} /> Generating...</>
            ) : (
              <><Sparkles size={16} /> Generate</>
            )}
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {media.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 animate-float"
              style={{ background: 'rgba(255,50,180,0.08)', border: '1px solid rgba(255,50,180,0.15)' }}>
              <ImagePlus size={36} style={{ color: 'var(--color-neon-magenta)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Create Visual Content
            </h3>
            <p className="text-sm max-w-md" style={{ color: 'var(--color-text-muted)' }}>
              Describe an image and watch it come to life using OpenRouter models.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {media.map((item) => (
              <div key={item.id} className="group relative glass-subtle overflow-hidden cursor-pointer animate-fade-in"
                onClick={() => setLightbox(item)}>
                {item.type === 'image' && item.url ? (
                  <img src={item.url} alt={item.prompt}
                    className="w-full aspect-square object-cover rounded-xl transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="w-full aspect-square rounded-xl p-4 flex items-center justify-center bg-black/40 text-xs overflow-y-auto">
                    {item.content}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col justify-end p-3">
                  <p className="text-xs text-white/90 line-clamp-2">{item.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-3xl max-h-[80vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {lightbox.type === 'image' && lightbox.url ? (
              <img src={lightbox.url} alt={lightbox.prompt} className="max-w-full max-h-[80vh] rounded-2xl" />
            ) : (
              <div className="glass-strong p-8 max-w-2xl max-h-[70vh] overflow-y-auto rounded-2xl text-sm">
                {lightbox.content}
              </div>
            )}
            <button onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors">
              <X size={16} className="text-white" />
            </button>
            <div className="mt-4 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-2xl text-center">
              <p className="text-sm text-white/90">{lightbox.prompt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
