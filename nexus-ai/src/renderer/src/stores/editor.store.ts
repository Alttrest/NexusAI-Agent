import { create } from 'zustand'

interface EditorState {
  currentFile: string | null
  currentContent: string
  openFiles: { path: string; name: string }[]
  projectPath: string | null
  setCurrentFile: (path: string | null, content?: string) => void
  setCurrentContent: (content: string) => void
  addOpenFile: (path: string, name: string) => void
  removeOpenFile: (path: string) => void
  setProjectPath: (path: string | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  currentFile: null,
  currentContent: '',
  openFiles: [],
  projectPath: null,
  setCurrentFile: (path, content = '') => set({ currentFile: path, currentContent: content }),
  setCurrentContent: (content) => set({ currentContent: content }),
  addOpenFile: (path, name) =>
    set((s) => {
      if (s.openFiles.find((f) => f.path === path)) return s
      return { openFiles: [...s.openFiles, { path, name }] }
    }),
  removeOpenFile: (path) =>
    set((s) => ({
      openFiles: s.openFiles.filter((f) => f.path !== path),
      currentFile: s.currentFile === path ? null : s.currentFile,
    })),
  setProjectPath: (path) => set({ projectPath: path }),
}))
