// Type definitions for Electron API exposed through preload script

export interface ElectronAPI {
  // App methods
  getVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  getVersions: () => Promise<{ node: string; electron: string; chrome: string }>

  // System methods
  getSystemPaths: () => Promise<{
    homeDir: string
    appDataDir: string
    vscodeConfigDir: string
    storagePath: string
    dbPath: string
    machineIdPath: string
    workspaceStoragePath: string
  }>

  // Dialog methods
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>
  showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>
  showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>

  // Window controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  isWindowMaximized: () => Promise<boolean>

  // File operations
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
  readFile: (filePath: string) => Promise<string>
  copyFile: (src: string, dest: string) => Promise<{ success: boolean }>
  fileExists: (filePath: string) => Promise<boolean>
  getFileInfo: (filePath: string) => Promise<{
    size: number
    isFile: boolean
    isDirectory: boolean
    mtime: Date
    ctime: Date
  }>

  // SQLite operations
  cleanSqliteData: (dbPath: string) => Promise<{ deletedRows: number }>
  validateSqliteFile: (dbPath: string) => Promise<boolean>
  countAugmentRecords: (dbPath: string) => Promise<number>
  getDatabaseInfo: (dbPath: string) => Promise<{
    tables: string[]
    totalRecords: number
    augmentRecords: number
  }>
  previewAugmentRecords: (dbPath: string) => Promise<Array<{ key: string; value: string }>>

  // Process operations
  isVSCodeRunning: () => Promise<boolean>

  // Workspace operations
  getWorkspaceInfo: (workspacePath: string) => Promise<{
    exists: boolean
    totalFiles: number
    totalDirectories: number
    totalSize: number
  }>
  previewWorkspaceContents: (workspacePath: string, maxItems?: number) => Promise<Array<{
    name: string
    type: 'file' | 'directory'
    size: number
    path: string
  }>>
  cleanWorkspaceStorage: (workspacePath: string) => Promise<{
    backupPath: string
    deletedFilesCount: number
    failedOperations: Array<{
      type: 'file' | 'directory'
      path: string
      error: string
    }>
    failedCompressions: Array<{
      file: string
      error: string
    }>
  }>
  createWorkspaceBackup: (workspacePath: string) => Promise<string>
  restoreWorkspaceBackup: (backupPath: string, targetPath: string) => Promise<{ success: boolean }>

  // Shell operations
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>

  // Event listeners
  onShowAbout: (callback: () => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
