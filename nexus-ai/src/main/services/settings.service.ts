import Store from 'electron-store'

interface SettingsSchema {
  openRouterApiKey: string
  theme: 'dark' | 'light' | 'system'
  autoGitCommit: boolean
  defaultModel: string
  githubToken?: string
  zenBrowserPath?: string
  pythonPath?: string
}

export class SettingsService {
  private static instance: SettingsService
  private store: Store<SettingsSchema>

  private constructor() {
    this.store = new Store<SettingsSchema>({
      defaults: {
        openRouterApiKey: '',
        theme: 'dark',
        autoGitCommit: true,
        defaultModel: 'openai/gpt-4o-mini',
      }
    })
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService()
    }
    return SettingsService.instance
  }

  public get(key: keyof SettingsSchema): any {
    return this.store.get(key)
  }

  public set(key: keyof SettingsSchema, value: any): void {
    this.store.set(key, value)
  }

  public getAll(): SettingsSchema {
    return this.store.store
  }

  public has(key: keyof SettingsSchema): boolean {
    return this.store.has(key)
  }
}
