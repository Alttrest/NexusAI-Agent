import { ipcMain, dialog } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'

export function registerFilesHandlers(): void {
  ipcMain.handle('files:readDir', async (_event, dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      const items = entries
        .filter(e => !e.name.startsWith('.') && e.name !== 'node_modules')
        .map(e => ({
          name: e.name,
          path: path.join(dirPath, e.name),
          isDirectory: e.isDirectory(),
          isFile: e.isFile()
        }))
        .sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        })
      return { success: true, data: items }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('files:readFile', async (_event, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return { success: true, data: content }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('files:writeFile', async (_event, filePath: string, content: string) => {
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('files:createDir', async (_event, dirPath: string) => {
    try {
      await fs.mkdir(dirPath, { recursive: true })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('files:delete', async (_event, targetPath: string) => {
    try {
      const stat = await fs.stat(targetPath)
      if (stat.isDirectory()) {
        await fs.rm(targetPath, { recursive: true })
      } else {
        await fs.unlink(targetPath)
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('files:exists', async (_event, targetPath: string) => {
    try {
      await fs.access(targetPath)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('files:selectDir', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) {
      return { success: true, data: null }
    }
    return { success: true, data: result.filePaths[0] }
  })
}
