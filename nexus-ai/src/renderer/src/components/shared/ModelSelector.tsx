import { useState, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useChatStore } from '../../stores/chat.store'
import { useAppStore } from '../../stores/app.store'

const IMAGE_MODEL_KEYWORDS = ['dall-e', 'stable-diffusion', 'flux', 'midjourney', 'runway', 'sdxl']

export default function ModelSelector() {
  const { selectedModel, setSelectedModel, models, setModels } = useChatStore()
  const { mode } = useAppStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    window.nexusAPI.chat.listModels().then((res: any) => {
      if (res.success && res.data) {
        const filtered = res.data
          .filter((m: any) => m.id)
          .sort((a: any, b: any) => (a.id as string).localeCompare(b.id as string))
        setModels(filtered)
      }
    }).catch(() => {})
  }, [])

  const FALLBACK_IMAGE_MODELS = [
    { id: 'openai/dall-e-3', name: 'DALL-E 3' },
    { id: 'google/imagen-3', name: 'Imagen 3' },
    { id: 'stability/stable-diffusion-xl', name: 'SDXL' }
  ]

  const displayName = selectedModel.split('/').pop() || selectedModel

  let filtered = models.filter((m: any) => {
    const matchesSearch = m.id.toLowerCase().includes(search.toLowerCase()) ||
                          (m.name && m.name.toLowerCase().includes(search.toLowerCase()))
    
    const isImageModel = IMAGE_MODEL_KEYWORDS.some(kw => m.id.toLowerCase().includes(kw))
    const matchesMode = mode === 'studio' ? isImageModel : !isImageModel
    
    return matchesSearch && matchesMode
  })

  // Fallback if no models matched image mode
  if (mode === 'studio' && filtered.length === 0 && search === '') {
    filtered = FALLBACK_IMAGE_MODELS as any
  }
  
  filtered = filtered.slice(0, 30)

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5"
        style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-glass-border)' }}>
        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-neon-green)', boxShadow: '0 0 6px var(--color-neon-green)' }} />
        {displayName}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 glass-strong z-50 overflow-hidden animate-fade-in">
          <div className="p-2 border-b" style={{ borderColor: 'var(--color-glass-border)' }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models..."
                className="input-glow pl-9 py-2 text-xs"
                autoFocus />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="text-xs p-3 text-center" style={{ color: 'var(--color-text-muted)' }}>No models found</p>
            )}
            {filtered.map((m: any) => (
              <button key={m.id}
                onClick={() => { setSelectedModel(m.id); setOpen(false); setSearch('') }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/5 flex items-center gap-2"
                style={{ color: m.id === selectedModel ? 'var(--color-neon-cyan)' : 'var(--color-text-secondary)' }}>
                {m.id === selectedModel && (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-neon-cyan)' }} />
                )}
                <span className="truncate">{m.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
