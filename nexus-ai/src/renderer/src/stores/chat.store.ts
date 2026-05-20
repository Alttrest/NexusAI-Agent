import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  activity?: { id: string, type: string, message: string }[]
}

interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
  streamBuffer: string
  selectedModel: string
  models: any[]
  addMessage: (msg: ChatMessage) => void
  updateLastAssistant: (content: string) => void
  setStreaming: (v: boolean) => void
  appendStreamBuffer: (chunk: string) => void
  clearStreamBuffer: () => void
  setSelectedModel: (model: string) => void
  setModels: (models: any[]) => void
  clearMessages: () => void
  updateLastAssistantActivity: (activity: { id: string, type: string, message: string }) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamBuffer: '',
  selectedModel: 'openai/gpt-4o-mini',
  models: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastAssistant: (content) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content }
      }
      return { messages: msgs }
    }),
  setStreaming: (v) => set({ isStreaming: v }),
  appendStreamBuffer: (chunk) => set((s) => ({ streamBuffer: s.streamBuffer + chunk })),
  clearStreamBuffer: () => set({ streamBuffer: '' }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setModels: (models) => set({ models }),
  clearMessages: () => set({ messages: [] }),
  updateLastAssistantActivity: (activity) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant') {
        const currentActivity = last.activity || []
        msgs[msgs.length - 1] = { ...last, activity: [...currentActivity, activity] }
      }
      return { messages: msgs }
    }),
}))
