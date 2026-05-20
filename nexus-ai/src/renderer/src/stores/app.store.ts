import { create } from 'zustand'

type Theme = 'dark' | 'light'
type AppMode = 'chat' | 'studio' | 'code' | 'learn'

interface AppState {
  theme: Theme
  mode: AppMode
  setupCompleted: boolean
  sidebarCollapsed: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setMode: (mode: AppMode) => void
  setSetupCompleted: (v: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  mode: 'chat',
  setupCompleted: false,
  sidebarCollapsed: false,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setMode: (mode) => set({ mode }),
  setSetupCompleted: (v) => set({ setupCompleted: v }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
