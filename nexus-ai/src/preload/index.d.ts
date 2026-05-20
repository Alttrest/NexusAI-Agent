import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    nexusAPI: any // Ideally, define a strict type here
  }
}
