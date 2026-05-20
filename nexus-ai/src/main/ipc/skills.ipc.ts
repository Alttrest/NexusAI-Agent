import { ipcMain } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import { exec } from 'child_process'

/**
 * Execute a skill by name with the given parameters.
 * Returns a string result that gets fed back to the LLM.
 */
export async function executeSkill(name: string, args: Record<string, any>): Promise<string> {
  switch (name) {
    case 'file_read': {
      const content = await fs.readFile(args.path, 'utf-8')
      return content
    }

    case 'file_write': {
      await fs.mkdir(path.dirname(args.path), { recursive: true })
      await fs.writeFile(args.path, args.content, 'utf-8')
      return `File written successfully: ${args.path}`
    }

    case 'file_delete': {
      const stat = await fs.stat(args.path)
      if (stat.isDirectory()) {
        await fs.rm(args.path, { recursive: true })
      } else {
        await fs.unlink(args.path)
      }
      return `Deleted: ${args.path}`
    }

    case 'list_directory': {
      const entries = await fs.readdir(args.path, { withFileTypes: true })
      const items = entries
        .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
        .map(e => `${e.isDirectory() ? '[DIR]' : '[FILE]'} ${e.name}`)
        .sort()
      return items.join('\n') || '(empty directory)'
    }

    case 'run_command': {
      return new Promise((resolve) => {
        const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh'
        const opts: any = { shell, timeout: 30000 }
        if (args.cwd) opts.cwd = args.cwd

        exec(args.command, opts, (error, stdout, stderr) => {
          if (error) {
            resolve(`Error (exit ${error.code}): ${stderr || error.message}\n${stdout}`)
          } else {
            resolve(stdout + (stderr ? `\nSTDERR: ${stderr}` : ''))
          }
        })
      })
    }

    case 'web_scrape': {
      const response = await fetch(args.url)
      const text = await response.text()
      // Truncate to avoid token overflow
      return text.slice(0, 8000)
    }

    default:
      return `Unknown skill: ${name}`
  }
}

export function registerSkillsHandlers(): void {
  ipcMain.handle('skills:list', async () => {
    return {
      success: true,
      data: [
        { name: 'file_read', description: 'Read file contents', category: 'files' },
        { name: 'file_write', description: 'Create or overwrite a file', category: 'files' },
        { name: 'file_delete', description: 'Delete a file or directory', category: 'files' },
        { name: 'list_directory', description: 'List directory contents', category: 'files' },
        { name: 'run_command', description: 'Execute a shell command', category: 'system' },
        { name: 'web_scrape', description: 'Fetch URL content', category: 'web' },
      ]
    }
  })

  ipcMain.handle('skills:execute', async (_event, skillName: string, params: any) => {
    try {
      const result = await executeSkill(skillName, params)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
