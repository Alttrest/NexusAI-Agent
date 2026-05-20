import { ipcMain } from 'electron'

export function registerGitHandlers(): void {
  ipcMain.handle('git:status', async (_event, repoPath: string) => {
    try {
      const { simpleGit } = await import('simple-git')
      const git = simpleGit(repoPath)
      const status = await git.status()
      return { success: true, data: status }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('git:commit', async (_event, repoPath: string, message: string) => {
    try {
      const { simpleGit } = await import('simple-git')
      const git = simpleGit(repoPath)
      await git.add('-A')
      const result = await git.commit(message)
      return { success: true, data: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('git:autoBackup', async (_event, repoPath: string) => {
    try {
      const { simpleGit } = await import('simple-git')
      const git = simpleGit(repoPath)
      const status = await git.status()
      if (status.files.length > 0) {
        await git.add('-A')
        await git.commit('Pre-AI modification backup')
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('git:init', async (_event, repoPath: string) => {
    try {
      const { simpleGit } = await import('simple-git')
      const git = simpleGit(repoPath)
      await git.init()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
