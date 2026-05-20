import { ipcMain } from 'electron'
import { SettingsService } from '../services/settings.service'

export function registerSettingsHandlers(): void {
  const settings = SettingsService.getInstance()

  ipcMain.handle('settings:get', async (_event, key: string) => {
    return settings.get(key)
  })

  ipcMain.handle('settings:set', async (_event, key: string, value: any) => {
    settings.set(key, value)
    return { success: true }
  })

  ipcMain.handle('settings:getAll', async () => {
    return settings.getAll()
  })

  ipcMain.handle('settings:has', async (_event, key: string) => {
    return settings.has(key)
  })
}
