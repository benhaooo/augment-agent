import { join } from 'node:path'
import process from 'node:process'
import { attachTitlebarToWindow, setupTitlebar } from 'custom-electron-titlebar/main'
import { app, BrowserWindow, shell } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { removeIpcHandlers, setupIpcHandlers } from './ipcHandlers'
import { createMenu } from './menu'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// This is only needed for production builds with Squirrel installer
// if (require('electron-squirrel-startup')) {
//   app.quit()
// }

setupTitlebar()

class ElectronApp {
  private mainWindow: BrowserWindow | null = null

  constructor() {
    this.init()
  }

  private init(): void {
    app.whenReady().then(() => {
      // Set app user model id for windows
      electronApp.setAppUserModelId('com.electron')

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
  }

  private createWindow(): void {
    // Create the browser window
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      frame: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: true,
      ...(process.platform === 'linux' ? { icon: join(__dirname, '../../build/icon.png') } : {}),
      webPreferences: {
        sandbox: false,
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../preload/index.cjs'),
        webSecurity: true,
        allowRunningInsecureContent: false
      }
    })
    attachTitlebarToWindow(this.mainWindow)

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
      this.mainWindow.webContents.openDevTools()
    }
    else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

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
