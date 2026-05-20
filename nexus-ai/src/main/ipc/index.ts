import { ipcMain } from 'electron'
import { registerChatHandlers } from './chat.ipc'
import { registerSettingsHandlers } from './settings.ipc'
import { registerFilesHandlers } from './files.ipc'
import { registerGitHandlers } from './git.ipc'
import { registerSkillsHandlers } from './skills.ipc'
import { registerStudioHandlers } from './studio.ipc'
import { registerLearnHandlers } from './learn.ipc'

export function registerAllIpcHandlers(): void {
  registerChatHandlers()
  registerSettingsHandlers()
  registerFilesHandlers()
  registerGitHandlers()
  registerSkillsHandlers()
  registerStudioHandlers()
  registerLearnHandlers()
}
