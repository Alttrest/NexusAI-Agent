import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, TerminalSquare } from 'lucide-react'
import { useEditorStore } from '../stores/editor.store'
import { useChatStore } from '../stores/chat.store'
import FileTree from '../components/shared/FileTree'
import Editor from '@monaco-editor/react'

interface ActivityLog {
  id: string
  type: string
  message: string
}

export default function CodeMode() {
  const { currentFile, currentContent, openFiles, projectPath, setCurrentFile, setCurrentContent, addOpenFile, removeOpenFile } = useEditorStore()
  const { selectedModel } = useChatStore()
  
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiOutput, setAiOutput] = useState('')
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])

  const activityEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activityLog])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentContent(value)
    }
  }

  const handleFileSelect = async (path: string, name: string) => {
    const res = await window.nexusAPI.files.readFile(path)
    if (res.success) {
      addOpenFile(path, name)
      setCurrentFile(path, res.data)
      setAiOutput('')
      setActivityLog([])
    }
  }

  const handleTabClose = (path: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeOpenFile(path)
  }

  const handleCommand = async () => {
    if (!input.trim() || isProcessing) return
    setIsProcessing(true)
    setAiOutput('Processing instruction...\n')
    setActivityLog([])
    
    try {
      const messages = [
        { 
          role: 'system', 
          content: `You are an AI programming assistant. 
Workspace/Project Root: ${projectPath || 'None specified'}.
The active file is: ${currentFile || 'none'}.
${currentContent ? `Here is the current content of the file:\n\`\`\`\n${currentContent}\n\`\`\`` : 'The editor is empty.'}
Help the user modify the file or write new code based on their instructions.
You are currently working in the workspace: ${projectPath || 'Unknown'}. Default all file_write and list_directory commands to this workspace path. NEVER hallucinate web links or simulate actions. You MUST trigger the appropriate JSON tool call to fetch real data or modify files.` 
        },
        { role: 'user', content: input.trim() }
      ]

      let buffer = ''
      
      const removeChunk = window.nexusAPI.chat.onStreamChunk((chunk: string) => {
        buffer += chunk
        setAiOutput(prev => prev + chunk)
      })

      const removeActivity = window.nexusAPI.chat.onStreamActivity((activity: { type: string, message: string }) => {
        setActivityLog(prev => [...prev, { id: Date.now().toString() + Math.random(), ...activity }])
      })

      const removeEnd = window.nexusAPI.chat.onStreamEnd(async () => {
        removeChunk()
        removeActivity()
        removeEnd()
        removeError()
        setIsProcessing(false)
        setInput('')
        
        // Refresh content if the AI modified it
        if (currentFile) {
          const res = await window.nexusAPI.files.readFile(currentFile)
          if (res.success && res.data !== currentContent) {
            setCurrentContent(res.data)
          }
        }
      })

      const removeError = window.nexusAPI.chat.onStreamError((err: string) => {
        setAiOutput(prev => prev + `\nError: ${err}`)
        setIsProcessing(false)
        removeChunk()
        removeActivity()
        removeEnd()
        removeError()
      })

      await window.nexusAPI.chat.sendStream(selectedModel, messages)
    } catch (err: any) {
      setAiOutput(`Failed: ${err.message}`)
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3 border-b"
        style={{ borderColor: 'var(--color-glass-border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Code</h2>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(0,210,255,0.1)', color: 'var(--color-neon-cyan)', border: '1px solid rgba(0,210,255,0.2)' }}>
          IDE Mode
        </span>
      </div>

      {/* Tabs */}
      {openFiles.length > 0 && (
        <div className="flex items-center gap-0.5 px-2 py-1 border-b overflow-x-auto"
          style={{ borderColor: 'var(--color-glass-border)', background: 'rgba(5,5,20,0.3)' }}>
          {openFiles.map((f) => (
            <button key={f.path}
              onClick={() => handleFileSelect(f.path, f.name)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap"
              style={{
                color: currentFile === f.path ? 'var(--color-neon-cyan)' : 'var(--color-text-secondary)',
                background: currentFile === f.path ? 'rgba(0,210,255,0.08)' : 'transparent',
              }}>
              {f.name}
              <span onClick={(e) => handleTabClose(f.path, e)}
                className="p-0.5 rounded hover:bg-white/10 transition-colors">
                <X size={10} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 3-Column Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUMN 1: File Tree (LEFT) */}
        <div className="border-r overflow-hidden flex flex-col"
          style={{ width: 240, borderColor: 'var(--color-glass-border)', background: 'rgba(5,5,20,0.4)' }}>
          <div className="px-4 py-2 border-b text-xs font-semibold uppercase tracking-wider"
            style={{ borderColor: 'var(--color-glass-border)', color: 'var(--color-text-muted)' }}>
            Explorer
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree onFileSelect={handleFileSelect} />
          </div>
        </div>

        {/* COLUMN 2: Monaco Editor (MIDDLE) */}
        <div className="flex-1 relative flex flex-col bg-[#07070f]">
          <div className="flex-1 relative">
            {!currentFile ? (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float"
                    style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)' }}>
                    <span className="text-2xl">{'</>'}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Open a file from the explorer →
                  </p>
                </div>
              </div>
            ) : (
              <Editor
                height="100%"
                language={getLanguage(currentFile)}
                theme="vs-dark"
                value={currentContent}
                onChange={handleEditorChange}
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: true, scale: 0.8 },
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  renderLineHighlight: 'all',
                  bracketPairColorization: { enabled: true },
                  automaticLayout: true,
                  wordWrap: 'on',
                  roundedSelection: true,
                }}
              />
            )}
          </div>
        </div>

        {/* COLUMN 3: AI Panel (RIGHT) */}
        <div className="border-l flex flex-col"
          style={{ width: 340, borderColor: 'var(--color-glass-border)', background: 'var(--color-bg-surface)' }}>
          
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--color-glass-border)' }}>
            <TerminalSquare size={16} style={{ color: 'var(--color-neon-purple)' }} />
            <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text-primary)' }}>
              Agent Terminal
            </span>
          </div>

          {/* Activity Log / Transparency Stream */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {activityLog.length === 0 && !aiOutput && (
              <div className="text-center mt-10">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No active tasks.</p>
              </div>
            )}
            
            {activityLog.map((log) => (
              <div key={log.id} className="text-xs font-mono animate-fade-in">
                {log.type === 'thinking' && (
                  <span style={{ color: 'var(--color-neon-cyan)' }}>[AGENT THINKING]: {log.message}</span>
                )}
                {log.type === 'action' && (
                  <span style={{ color: 'var(--color-warning)' }}>[ACTION]: {log.message}</span>
                )}
                {log.type === 'result' && (
                  <span style={{ color: 'var(--color-neon-green)' }}>[RESULT]: {log.message}</span>
                )}
              </div>
            ))}
            
            <div ref={activityEndRef} />

            {/* AI Output Stream */}
            {aiOutput && (
              <div className="mt-4 p-3 rounded-lg border" style={{ borderColor: 'var(--color-glass-border)', background: 'var(--color-bg-deep)' }}>
                <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                  {aiOutput.replace('Processing instruction...\n', '')}
                </pre>
              </div>
            )}
          </div>

          {/* Command Input Box */}
          <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--color-glass-border)', background: 'var(--color-bg-deep)' }}>
            <div className="relative">
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleCommand()
                  }
                }}
                placeholder="Ask AI to modify code..."
                className="input-glow w-full pr-12 text-sm resize-none" 
                rows={3}
                disabled={isProcessing} />
              <button onClick={handleCommand}
                className="absolute right-2 bottom-2 btn-neon-solid p-2 rounded-lg flex items-center justify-center"
                disabled={!input.trim() || isProcessing}>
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
    html: 'html', css: 'css', scss: 'scss', json: 'json', md: 'markdown',
    py: 'python', rs: 'rust', go: 'go', java: 'java', cpp: 'cpp', c: 'c',
    sh: 'shell', bash: 'shell', yml: 'yaml', yaml: 'yaml', xml: 'xml',
    sql: 'sql', graphql: 'graphql', vue: 'html', svelte: 'html',
  }
  return map[ext] || 'plaintext'
}
