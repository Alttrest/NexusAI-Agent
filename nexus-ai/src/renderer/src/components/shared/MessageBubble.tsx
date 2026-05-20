import { marked } from 'marked'
import { useMemo } from 'react'
import { User, Bot } from 'lucide-react'
import { ChatMessage } from '../../stores/chat.store'

interface Props {
  message: ChatMessage
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  const html = useMemo(() => {
    if (!message.content) return ''
    try {
      return marked.parse(message.content, { breaks: true }) as string
    } catch {
      return message.content
    }
  }, [message.content])

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: isUser
            ? 'rgba(0, 210, 255, 0.12)'
            : 'rgba(160, 50, 255, 0.12)',
          border: `1px solid ${isUser ? 'rgba(0, 210, 255, 0.2)' : 'rgba(160, 50, 255, 0.2)'}`,
        }}>
        {isUser
          ? <User size={14} style={{ color: 'var(--color-neon-cyan)' }} />
          : <Bot size={14} style={{ color: 'var(--color-neon-purple)' }} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] px-4 py-3 flex flex-col ${isUser ? 'msg-user' : 'msg-assistant'}`}>
        {message.activity && message.activity.length > 0 && (
          <div className="mb-3 p-3 rounded-lg border border-white/5 bg-black/20 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center gap-2 mb-2 font-semibold uppercase tracking-wider" style={{ color: 'var(--color-neon-cyan)', fontSize: '10px' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> Agent Process Log
            </div>
            <div className="flex flex-col gap-1">
              {message.activity.map(act => (
                <div key={act.id} className="opacity-90 leading-tight">
                  <span className={act.type === 'action' ? 'text-yellow-500' : act.type === 'result' ? 'text-green-400' : 'text-blue-400'}>
                    [{act.type.toUpperCase()}]
                  </span> <span className="text-white/70">{act.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="mt-2 text-right" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
