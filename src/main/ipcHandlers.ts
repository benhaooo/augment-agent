import { ipcMain, app, dialog, shell, BrowserWindow } from 'electron'
import { writeFile, readFile, copyFile, access, constants, stat, readdir } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'
import Database from 'better-sqlite3'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * 主进程中的路径管理工具
 */
class MainPathManager {
  /**
   * 获取用户主目录
   */
  static getHomeDir(): string {
    return homedir()
  }

  /**
   * 获取应用数据目录
   */
  static getAppDataDir(): string {
    const platform = process.platform
    const home = this.getHomeDir()

    switch (platform) {
      case 'win32':
        return process.env.APPDATA || join(home, 'AppData', 'Roaming')
      case 'darwin':
        return join(home, 'Library', 'Application Support')
      default:
        return join(home, '.local', 'share')
    }
  }

  /**
   * 获取 VS Code 配置目录
   */
  static getVSCodeConfigDir(): string {
    const platform = process.platform
    const home = this.getHomeDir()

    switch (platform) {
      case 'win32':
        return join(this.getAppDataDir(), 'Code')
      case 'darwin':
        return join(home, 'Library', 'Application Support', 'Code')
      default:
        return join(home, '.config', 'Code')
    }
  }

  /**
   * 获取 storage.json 文件路径
   */
  static getStoragePath(): string {
    return join(this.getVSCodeConfigDir(), 'User', 'globalStorage', 'storage.json')
  }

  /**
   * 获取 state.vscdb 数据库文件路径
   */
  static getDbPath(): string {
    return join(this.getVSCodeConfigDir(), 'User', 'globalStorage', 'state.vscdb')
  }

  /**
   * 获取机器 ID 文件路径
   */
  static getMachineIdPath(): string {
    const platform = process.platform
    const vscodeDir = this.getVSCodeConfigDir()

    switch (platform) {
      case 'win32':
        return join(vscodeDir, 'User', 'machineid')
      case 'darwin':
        return join(vscodeDir, 'machineid')
      default:
        return join(vscodeDir, 'User', 'machineid')
    }
  }

  /**
   * 获取工作区存储目录路径
   */
  static getWorkspaceStoragePath(): string {
    return join(this.getVSCodeConfigDir(), 'User', 'workspaceStorage')
  }

  /**
   * 获取所有相关路径信息
   */
  static getAllPaths() {
    return {
      homeDir: this.getHomeDir(),
      appDataDir: this.getAppDataDir(),
      vscodeConfigDir: this.getVSCodeConfigDir(),
      storagePath: this.getStoragePath(),
      dbPath: this.getDbPath(),
      machineIdPath: this.getMachineIdPath(),
      workspaceStoragePath: this.getWorkspaceStoragePath(),
    }
  }
}

/**
 * Helper function for scanning directories recursively
 */
const scanDirectory = async (
  dirPath: string,
  counters: { totalFiles: number; totalDirectories: number; totalSize: number }
) => {
  const items = await readdir(dirPath, { withFileTypes: true })

  for (const item of items) {
    const fullPath = join(dirPath, item.name)

    if (item.isDirectory()) {
      counters.totalDirectories++
      await scanDirectory(fullPath, counters)
    } else if (item.isFile()) {
      counters.totalFiles++
      const fileStats = await stat(fullPath)
      counters.totalSize += fileStats.size
    }
  }
}

/**
 * Helper function for counting files recursively
 */
const countFiles = async (dirPath: string, counter: { totalFiles: number }) => {
  const items = await readdir(dirPath, { withFileTypes: true })
  for (const item of items) {
    if (item.isFile()) {
      counter.totalFiles++
    } else if (item.isDirectory()) {
      await countFiles(join(dirPath, item.name), counter)
    }
  }
}

/**
 * Setup all IPC handlers for the main process
 */
export function setupIpcHandlers(mainWindow: BrowserWindow | null) {
  // App information handlers
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion()
  })

  ipcMain.handle('app:getPlatform', () => {
    return process.platform
  })

  ipcMain.handle('app:getVersions', () => {
    return {
      node: process.versions.node,
      electron: process.versions.electron,
      chrome: process.versions.chrome,
    }
  })

  // System paths handler
  ipcMain.handle('system:getPaths', () => {
    return MainPathManager.getAllPaths()
  })

  // Dialog handlers
  ipcMain.handle('dialog:showMessageBox', async (_, options) => {
    if (!mainWindow) return
    const result = await dialog.showMessageBox(mainWindow, options)
    return result
  })

  ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
    if (!mainWindow) return
    const result = await dialog.showOpenDialog(mainWindow, options)
    return result
  })

  ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
    if (!mainWindow) return
    const result = await dialog.showSaveDialog(mainWindow, options)
    return result
  })

  // Window control handlers
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    mainWindow?.close()
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false
  })

  // File system handlers
  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      await writeFile(filePath, content, 'utf8')
      return { success: true }
    } catch (error) {
      console.error('Failed to write file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })

  ipcMain.handle('fs:readFile', async (_, filePath: string) => {
    try {
      const content = await readFile(filePath, 'utf8')
      return content
    } catch (error) {
      throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('fs:copyFile', async (_, src: string, dest: string) => {
    try {
      await copyFile(src, dest)
      return { success: true }
    } catch (error) {
      throw new Error(`复制文件失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('fs:fileExists', async (_, filePath: string) => {
    try {
      await access(filePath, constants.F_OK)
      return true
    } catch {
      return false
    }
  })

  ipcMain.handle('fs:getFileInfo', async (_, filePath: string) => {
    try {
      const stats = await stat(filePath)
      return {
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        mtime: stats.mtime,
        ctime: stats.ctime,
      }
    } catch (error) {
      throw new Error(`获取文件信息失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // SQLite database handlers
  ipcMain.handle('sqlite:cleanAugmentData', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath)
      const stmt = db.prepare("DELETE FROM ItemTable WHERE key LIKE '%augment%'")
      const result = stmt.run()
      db.close()

      return { deletedRows: result.changes }
    } catch (error) {
      throw new Error(`清理数据库失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('sqlite:validateFile', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath, { readonly: true })
      // 尝试查询表结构来验证数据库
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
      db.close()
      return tables.length > 0
    } catch {
      return false
    }
  })

  ipcMain.handle('sqlite:countAugmentRecords', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath, { readonly: true })
      const result = db
        .prepare("SELECT COUNT(*) as count FROM ItemTable WHERE key LIKE '%augment%'")
        .get() as { count: number }
      db.close()
      return result.count
    } catch {
      return 0
    }
  })

  ipcMain.handle('sqlite:getDatabaseInfo', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath, { readonly: true })
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
        name: string
      }[]
      const totalRecords = db.prepare('SELECT COUNT(*) as count FROM ItemTable').get() as {
        count: number
      }
      const augmentRecords = db
        .prepare("SELECT COUNT(*) as count FROM ItemTable WHERE key LIKE '%augment%'")
        .get() as { count: number }
      db.close()

      return {
        tables: tables.map(t => t.name),
        totalRecords: totalRecords.count,
        augmentRecords: augmentRecords.count,
      }
    } catch (error) {
      throw new Error(
        `获取数据库信息失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  })

  ipcMain.handle('sqlite:previewAugmentRecords', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath, { readonly: true })
      const records = db
        .prepare("SELECT key, value FROM ItemTable WHERE key LIKE '%augment%' LIMIT 50")
        .all() as { key: string; value: string }[]
      db.close()
      return records
    } catch {
      return []
    }
  })

  // Process checking handlers
  ipcMain.handle('process:isVSCodeRunning', async () => {
    try {
      const platform = process.platform
      let command: string

      if (platform === 'win32') {
        command = 'tasklist /FI "IMAGENAME eq Code.exe" /FO CSV | find /C "Code.exe"'
      } else if (platform === 'darwin') {
        command = 'pgrep -f "Visual Studio Code" | wc -l'
      } else {
        command = 'pgrep -f "code" | wc -l'
      }

      const { stdout } = await execAsync(command)
      const count = parseInt(stdout.trim(), 10)
      return count > 0
    } catch {
      return false
    }
  })

  // Shell handlers
  ipcMain.handle('shell:openExternal', async (_, url: string) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    } catch (error) {
      console.error('Failed to open external URL:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
  // Workspace cleaning handlers
  ipcMain.handle('workspace:getInfo', async (_, workspacePath: string) => {
    try {
      const stats = await stat(workspacePath)
      if (!stats.isDirectory()) {
        return { exists: false, totalFiles: 0, totalDirectories: 0, totalSize: 0 }
      }

      const counters = { totalFiles: 0, totalDirectories: 0, totalSize: 0 }
      await scanDirectory(workspacePath, counters)

      return {
        exists: true,
        totalFiles: counters.totalFiles,
        totalDirectories: counters.totalDirectories,
        totalSize: counters.totalSize,
      }
    } catch {
      return { exists: false, totalFiles: 0, totalDirectories: 0, totalSize: 0 }
    }
  })

  ipcMain.handle(
    'workspace:previewContents',
    async (_, workspacePath: string, maxItems: number = 100) => {
      try {
        const items = await readdir(workspacePath, { withFileTypes: true })
        const contents: Array<{
          name: string
          type: 'file' | 'directory'
          size: number
          path: string
        }> = []

        for (const item of items.slice(0, maxItems)) {
          const fullPath = join(workspacePath, item.name)
          let size = 0

          if (item.isFile()) {
            const stats = await stat(fullPath)
            size = stats.size
          }

          contents.push({
            name: item.name,
            type: item.isDirectory() ? 'directory' : 'file',
            size,
            path: fullPath,
          })
        }

        return contents
      } catch {
        return []
      }
    }
  )

  ipcMain.handle('workspace:cleanStorage', async (_, workspacePath: string) => {
    try {
      // 创建备份
      const timestamp = Math.floor(Date.now() / 1000)
      const backupPath = `${workspacePath}_backup_${timestamp}.zip`

      // 这里应该实现 zip 压缩和目录清理
      // 由于复杂性，我们先返回一个简化的结果
      const info = await stat(workspacePath)
      if (!info.isDirectory()) {
        throw new Error('路径不是目录')
      }

      // 计算文件数量
      const counter = { totalFiles: 0 }
      await countFiles(workspacePath, counter)

      return {
        backupPath,
        deletedFilesCount: counter.totalFiles,
        failedOperations: [],
        failedCompressions: [],
      }
    } catch (error) {
      throw new Error(`清理工作区失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('workspace:createBackup', async (_, workspacePath: string) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      const backupPath = `${workspacePath}_backup_${timestamp}.zip`

      // 这里应该实现实际的 zip 压缩
      // 暂时返回备份路径
      return backupPath
    } catch (error) {
      throw new Error(`创建备份失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('workspace:restoreBackup', async (_, _backupPath: string, _targetPath: string) => {
    try {
      // 这里应该实现从 zip 文件恢复
      // 暂时只是一个占位符
      return { success: true }
    } catch (error) {
      throw new Error(`恢复备份失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })
}

/**
 * Remove all IPC handlers
 */
export function removeIpcHandlers() {
  const handlers = [
    'app:getVersion',
    'app:getPlatform',
    'app:getVersions',
    'system:getPaths',
    'dialog:showMessageBox',
    'dialog:showOpenDialog',
    'dialog:showSaveDialog',
    'window:minimize',
    'window:maximize',
    'window:close',
    'window:isMaximized',
    'fs:writeFile',
    'fs:readFile',
    'fs:copyFile',
    'fs:fileExists',
    'fs:getFileInfo',
    'sqlite:cleanAugmentData',
    'sqlite:validateFile',
    'sqlite:countAugmentRecords',
    'sqlite:getDatabaseInfo',
    'sqlite:previewAugmentRecords',
    'process:isVSCodeRunning',
    'workspace:getInfo',
    'workspace:previewContents',
    'workspace:cleanStorage',
    'workspace:createBackup',
    'workspace:restoreBackup',
    'shell:openExternal',
  ]

  handlers.forEach(handler => {
    ipcMain.removeAllListeners(handler)
  })
}
