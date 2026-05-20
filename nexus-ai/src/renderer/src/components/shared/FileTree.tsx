import { useState } from 'react'
import { Folder, FileText, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react'
import { useEditorStore } from '../../stores/editor.store'

interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  isFile: boolean
}

interface Props {
  onFileSelect: (path: string, name: string) => void
}

function TreeNode({ entry, onFileSelect, depth = 0 }: { entry: FileEntry; onFileSelect: Props['onFileSelect']; depth?: number }) {
  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<FileEntry[]>([])

  const handleToggle = async () => {
    if (!entry.isDirectory) {
      onFileSelect(entry.path, entry.name)
      return
    }
    if (!expanded) {
      const res = await window.nexusAPI.files.readDir(entry.path)
      if (res.success) setChildren(res.data)
    }
    setExpanded(!expanded)
  }

  const ext = entry.name.split('.').pop()?.toLowerCase() || ''
  const isCode = ['ts', 'tsx', 'js', 'jsx', 'css', 'html', 'json', 'py', 'md'].includes(ext)

  return (
    <div>
      <button onClick={handleToggle}
        className="w-full flex items-center gap-1.5 py-1 px-2 rounded-md text-xs transition-colors hover:bg-white/5"
        style={{ paddingLeft: `${depth * 16 + 8}px`, color: 'var(--color-text-secondary)' }}>
        {entry.isDirectory ? (
          expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
        ) : (
          <span className="w-3" />
        )}
        {entry.isDirectory
          ? <Folder size={14} style={{ color: 'var(--color-neon-cyan)', opacity: 0.7 }} />
          : <FileText size={14} style={{ color: isCode ? 'var(--color-neon-purple)' : 'var(--color-text-muted)', opacity: 0.7 }} />}
        <span className="truncate">{entry.name}</span>
      </button>
      {expanded && children.map((child) => (
        <TreeNode key={child.path} entry={child} onFileSelect={onFileSelect} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function FileTree({ onFileSelect }: Props) {
  const { projectPath, setProjectPath } = useEditorStore()
  const [rootPath, setRootPath] = useState(projectPath || '')
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  const handleLoadFolder = async () => {
    if (!rootPath.trim()) return
    const res = await window.nexusAPI.files.readDir(rootPath.trim())
    if (res.success) {
      setEntries(res.data)
      setProjectPath(rootPath.trim())
      setLoaded(true)
    }
  }

  const handleSelectFolder = async () => {
    const res = await window.nexusAPI.files.selectDir()
    if (res.success && res.data) {
      setRootPath(res.data)
      const loadRes = await window.nexusAPI.files.readDir(res.data)
      if (loadRes.success) {
        setEntries(loadRes.data)
        setProjectPath(res.data)
        setLoaded(true)
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {!loaded ? (
        <div className="p-3 flex flex-col gap-2">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Project Folder</label>
          <div className="flex gap-2">
            <input value={rootPath} onChange={(e) => setRootPath(e.target.value)}
              placeholder="C:\path\to\project"
              className="input-glow text-xs py-2 flex-1 w-full min-w-0"
              onKeyDown={(e) => e.key === 'Enter' && handleLoadFolder()} />
            <button onClick={handleSelectFolder} className="btn-neon text-xs px-3 flex items-center justify-center">
              <FolderOpen size={14} />
            </button>
          </div>
          <button onClick={handleLoadFolder} className="btn-neon-solid text-xs py-2 w-full mt-1">Open Path</button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-1">
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}>
            Explorer
          </div>
          {entries.map((entry) => (
            <TreeNode key={entry.path} entry={entry} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  )
}
