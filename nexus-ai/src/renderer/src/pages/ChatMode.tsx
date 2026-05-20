import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Loader2 } from 'lucide-react'
import { useChatStore, ChatMessage } from '../stores/chat.store'
import MessageBubble from '../components/shared/MessageBubble'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export default function ChatMode() {
  const { messages, addMessage, updateLastAssistant, isStreaming, setStreaming, selectedModel, clearMessages } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text, timestamp: Date.now() }
    addMessage(userMsg)
    setInput('')
    setStreaming(true)

    // Add placeholder assistant message
    const assistantMsg: ChatMessage = { id: generateId(), role: 'assistant', content: '', timestamp: Date.now() }
    addMessage(assistantMsg)

    let buffer = ''

    const removeChunk = window.nexusAPI.chat.onStreamChunk((chunk: string) => {
      buffer += chunk
      updateLastAssistant(buffer)
    })

    const removeActivity = window.nexusAPI.chat.onStreamActivity((activity: { type: string, message: string }) => {
      useChatStore.getState().updateLastAssistantActivity({ id: Date.now().toString() + Math.random(), ...activity })
    })

    const removeEnd = window.nexusAPI.chat.onStreamEnd(() => {
      setStreaming(false)
      removeChunk()
      removeActivity()
      removeEnd()
      removeError()
    })

    const removeError = window.nexusAPI.chat.onStreamError((err: string) => {
      updateLastAssistant(`**Error:** ${err}`)
      setStreaming(false)
      removeChunk()
      removeActivity()
      removeEnd()
      removeError()
    })

    const apiMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }))
    apiMessages.push({ role: 'user', content: text })

    await window.nexusAPI.chat.sendStream(selectedModel, apiMessages)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: 'var(--color-glass-border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Chat</h2>
        <button onClick={clearMessages} className="btn-ghost flex items-center gap-1.5 text-xs"
          title="Clear chat">
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="loading-orb mb-6 animate-float" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Ready to assist
            </h3>
            <p className="text-sm max-w-md" style={{ color: 'var(--color-text-muted)' }}>
              Ask anything — code help, file operations, web search, or creative tasks.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--color-glass-border)' }}>
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Type your message..."
              className="input-glow resize-none pr-12"
              rows={1}
              style={{ minHeight: 44, maxHeight: 160 }}
              disabled={isStreaming} />
          </div>
          <button onClick={handleSend}
            className="btn-neon-solid p-3 rounded-xl flex items-center justify-center"
            disabled={!input.trim() || isStreaming}>
            {isStreaming
              ? <Loader2 size={18} className="animate-spin" />
              : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
