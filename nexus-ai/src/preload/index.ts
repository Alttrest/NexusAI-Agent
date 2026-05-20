import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  chat: {
    send: (model: string, messages: any[]) => ipcRenderer.invoke('chat:send', model, messages),
    sendStream: (model: string, messages: any[]) => ipcRenderer.invoke('chat:send-stream', model, messages),
    listModels: () => ipcRenderer.invoke('chat:list-models'),
    updateApiKey: (apiKey: string) => ipcRenderer.invoke('chat:update-api-key', apiKey),
    onStreamChunk: (callback: (chunk: string) => void) => {
      const handler = (_event: any, chunk: string) => callback(chunk)
      ipcRenderer.on('chat:stream-chunk', handler)
      return () => ipcRenderer.removeListener('chat:stream-chunk', handler)
    },
    onStreamToolCall: (callback: (toolCalls: any[]) => void) => {
      const handler = (_event: any, toolCalls: any[]) => callback(toolCalls)
      ipcRenderer.on('chat:stream-tool-call', handler)
      return () => ipcRenderer.removeListener('chat:stream-tool-call', handler)
    },
    onStreamEnd: (callback: () => void) => {
      const handler = () => callback()
      ipcRenderer.on('chat:stream-end', handler)
      return () => ipcRenderer.removeListener('chat:stream-end', handler)
    },
    onStreamError: (callback: (error: string) => void) => {
      const handler = (_event: any, error: string) => callback(error)
      ipcRenderer.on('chat:stream-error', handler)
      return () => ipcRenderer.removeListener('chat:stream-error', handler)
    },
    onStreamActivity: (callback: (activity: { type: string, message: string }) => void) => {
      const handler = (_event: any, activity: { type: string, message: string }) => callback(activity)
      ipcRenderer.on('chat:stream-activity', handler)
      return () => ipcRenderer.removeListener('chat:stream-activity', handler)
    }
  },
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
  },
  files: {
    readDir: (dirPath: string) => ipcRenderer.invoke('files:readDir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('files:readFile', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('files:writeFile', filePath, content),
    createDir: (dirPath: string) => ipcRenderer.invoke('files:createDir', dirPath),
    delete: (targetPath: string) => ipcRenderer.invoke('files:delete', targetPath),
    exists: (targetPath: string) => ipcRenderer.invoke('files:exists', targetPath),
    selectDir: () => ipcRenderer.invoke('files:selectDir'),
  },
  git: {
    status: (repoPath: string) => ipcRenderer.invoke('git:status', repoPath),
    commit: (repoPath: string, message: string) => ipcRenderer.invoke('git:commit', repoPath, message),
    autoBackup: (repoPath: string) => ipcRenderer.invoke('git:autoBackup', repoPath),
    init: (repoPath: string) => ipcRenderer.invoke('git:init', repoPath),
  },
  studio: {
    generate: (prompt: string, model: string) => ipcRenderer.invoke('studio:generate', prompt, model),
  },
  learn: {
    startSession: () => ipcRenderer.invoke('learn:start-session'),
    captureScreen: () => ipcRenderer.invoke('learn:capture-screen'),
    sendVision: (screenshot: string, task: string, model: string) => ipcRenderer.invoke('learn:send-vision', screenshot, task, model),
    showDot: (x: number, y: number) => ipcRenderer.invoke('learn:show-dot', x, y),
    hideDot: () => ipcRenderer.invoke('learn:hide-dot'),
    stopSession: () => ipcRenderer.invoke('learn:stop-session'),
  },
  pet: {
    onStateChange: (callback: (state: string) => void) => {
      const handler = (_event: any, state: string) => callback(state)
      ipcRenderer.on('pet:state-change', handler)
      return () => ipcRenderer.removeListener('pet:state-change', handler)
    }
  },
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('nexusAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.nexusAPI = api
}
