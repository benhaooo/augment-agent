import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { createMenu } from './menu'
import { setupIpcHandlers, removeIpcHandlers } from './ipcHandlers'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// This is only needed for production builds with Squirrel installer
// if (require('electron-squirrel-startup')) {
//   app.quit()
// }

class ElectronApp {
  private mainWindow: BrowserWindow | null = null
  private isDev = !app.isPackaged

  constructor() {
    this.init()
  }

  private init(): void {
    // This method will be called when Electron has finished initialization
    app.whenReady().then(() => {
      this.createWindow()
      this.setupMenu()
      this.setupIPC()

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow()
        }
      })
    })

    // Quit when all windows are closed, except on macOS
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        removeIpcHandlers()
        app.quit()
      }
    })

    // Security: Prevent new window creation
    app.on('web-contents-created', (_, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
      })
    })
  }

  private createWindow(): void {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      autoHideMenuBar: true, // 隐藏菜单栏，按 Alt 键显示
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/preload.cjs'),
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    })

    // Load the app
    if (this.isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
      // Open DevTools in development
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Show window when ready to prevent visual flash
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()
    })

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  private setupMenu(): void {
    createMenu()
  }

  private setupIPC(): void {
    setupIpcHandlers(this.mainWindow)
  }
}

// Create the application instance
new ElectronApp()
