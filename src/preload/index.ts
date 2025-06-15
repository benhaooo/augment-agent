import { Titlebar, TitlebarColor } from 'custom-electron-titlebar'
import { contextBridge, ipcRenderer } from 'electron'

// Define the API interface
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

  // Theme management
  updateTheme: (theme: string) => Promise<void>
  
  // VSCode process controls
  closeVSCode: () => Promise<boolean>
  reopenVSCode: () => Promise<boolean>

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

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  // App methods
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  getVersions: () => ipcRenderer.invoke('app:getVersions'),

  // System methods
  getSystemPaths: () => ipcRenderer.invoke('system:getPaths'),

  // Dialog methods
  showMessageBox: options => ipcRenderer.invoke('dialog:showMessageBox', options),
  showOpenDialog: options => ipcRenderer.invoke('dialog:showOpenDialog', options),
  showSaveDialog: options => ipcRenderer.invoke('dialog:showSaveDialog', options),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // Theme management
  updateTheme: (theme: string) => ipcRenderer.invoke('theme:update', theme),
  
  // VSCode process controls
  closeVSCode: () => ipcRenderer.invoke('vscode:close'),
  reopenVSCode: () => ipcRenderer.invoke('vscode:reopen'),

  // File operations
  writeFile: (filePath, content) => ipcRenderer.invoke('fs:writeFile', filePath, content),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  copyFile: (src, dest) => ipcRenderer.invoke('fs:copyFile', src, dest),
  fileExists: (filePath) => ipcRenderer.invoke('fs:fileExists', filePath),
  getFileInfo: (filePath) => ipcRenderer.invoke('fs:getFileInfo', filePath),

  // SQLite operations
  cleanSqliteData: (dbPath) => ipcRenderer.invoke('sqlite:cleanAugmentData', dbPath),
  validateSqliteFile: (dbPath) => ipcRenderer.invoke('sqlite:validateFile', dbPath),
  countAugmentRecords: (dbPath) => ipcRenderer.invoke('sqlite:countAugmentRecords', dbPath),
  getDatabaseInfo: (dbPath) => ipcRenderer.invoke('sqlite:getDatabaseInfo', dbPath),
  previewAugmentRecords: (dbPath) => ipcRenderer.invoke('sqlite:previewAugmentRecords', dbPath),

  // Process operations
  isVSCodeRunning: () => ipcRenderer.invoke('vscode:isRunning'),

  // Workspace operations
  getWorkspaceInfo: (workspacePath) => ipcRenderer.invoke('workspace:getInfo', workspacePath),
  previewWorkspaceContents: (workspacePath, maxItems) => ipcRenderer.invoke('workspace:previewContents', workspacePath, maxItems),
  cleanWorkspaceStorage: (workspacePath) => ipcRenderer.invoke('workspace:cleanStorage', workspacePath),
  createWorkspaceBackup: (workspacePath) => ipcRenderer.invoke('workspace:createBackup', workspacePath),
  restoreWorkspaceBackup: (backupPath, targetPath) => ipcRenderer.invoke('workspace:restoreBackup', backupPath, targetPath),

  // Shell operations
  openExternal: url => ipcRenderer.invoke('shell:openExternal', url),

  // Event listeners
  onShowAbout: (callback) => {
    ipcRenderer.on('show-about', callback)
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },
}

window.addEventListener('DOMContentLoaded', () => {
  // 初始化时根据document的类来判断当前主题
  const isDarkTheme = document.documentElement.classList.contains('dark')

  // 创建带有主题颜色的Titlebar
  const titlebar = new Titlebar({
    backgroundColor: isDarkTheme
      ? TitlebarColor.fromHex('#1f2937')
      : TitlebarColor.fromHex('#ffffff'),
    unfocusEffect: true,
  })

  // 监听主题变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes'
        && mutation.attributeName === 'class'
      ) {
        const isDark = document.documentElement.classList.contains('dark')
        // 根据当前主题更新titlebar背景色
        if (isDark) {
          titlebar.updateBackground(TitlebarColor.fromHex('#1f2937'))
        }
        else {
          titlebar.updateBackground(TitlebarColor.fromHex('#ffffff'))
        }
      }
    })
  })

  // 观察html元素的class变化，因为主题是通过添加/移除dark类来实现的
  observer.observe(document.documentElement, { attributes: true })
})

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declaration for global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
