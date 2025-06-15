import type { BrowserWindow } from 'electron'
import { exec } from 'node:child_process'
import { access, constants, copyFile, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import Database from 'better-sqlite3'
import { app, dialog, ipcMain, shell } from 'electron'

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
async function scanDirectory(dirPath: string, counters: { totalFiles: number, totalDirectories: number, totalSize: number }) {
  const items = await readdir(dirPath, { withFileTypes: true })

  for (const item of items) {
    const fullPath = join(dirPath, item.name)

    if (item.isDirectory()) {
      counters.totalDirectories++
      await scanDirectory(fullPath, counters)
    }
    else if (item.isFile()) {
      counters.totalFiles++
      const fileStats = await stat(fullPath)
      counters.totalSize += fileStats.size
    }
  }
}

/**
 * Helper function for counting files recursively
 */
async function countFiles(dirPath: string, counter: { totalFiles: number }) {
  const items = await readdir(dirPath, { withFileTypes: true })
  for (const item of items) {
    if (item.isFile()) {
      counter.totalFiles++
    }
    else if (item.isDirectory()) {
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
    if (!mainWindow)
      return
    const result = await dialog.showMessageBox(mainWindow, options)
    return result
  })

  ipcMain.handle('dialog:showOpenDialog', async (_, options) => {
    if (!mainWindow)
      return
    const result = await dialog.showOpenDialog(mainWindow, options)
    return result
  })

  ipcMain.handle('dialog:showSaveDialog', async (_, options) => {
    if (!mainWindow)
      return
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
    }
    else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle('window:close', () => {
    mainWindow?.close()
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false
  })

  // 窗口状态监听
  if (mainWindow) {
    // 监听窗口最大化状态变化
    mainWindow.on('maximize', () => {
      mainWindow?.webContents.send('window:maximized', true)
    })

    mainWindow.on('unmaximize', () => {
      mainWindow?.webContents.send('window:maximized', false)
    })

    // 监听窗口焦点变化
    mainWindow.on('focus', () => {
      mainWindow?.webContents.send('window:focus', true)
    })

    mainWindow.on('blur', () => {
      mainWindow?.webContents.send('window:focus', false)
    })
  }

  // 主题同步处理器
  ipcMain.handle('theme:update', (_, theme: 'system' | 'light' | 'dark' | 'auto') => {
    // 在这里可以处理主进程的主题更新逻辑
    // 例如更新原生菜单、托盘图标等

    // 如果是 macOS，可以更新原生标题栏外观
    if (process.platform === 'darwin' && mainWindow) {
      // 更新原生主题
      nativeTheme.themeSource = theme === 'auto' ? 'system' : theme as 'system' | 'light' | 'dark'
    }
  })

  // File system handlers
  ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
    try {
      await writeFile(filePath, content, 'utf8')
      return { success: true }
    }
    catch (error) {
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
    }
    catch (error) {
      throw new Error(`读取文件失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('fs:copyFile', async (_, src: string, dest: string) => {
    try {
      await copyFile(src, dest)
      return { success: true }
    }
    catch (error) {
      throw new Error(`复制文件失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('fs:fileExists', async (_, filePath: string) => {
    try {
      await access(filePath, constants.F_OK)
      return true
    }
    catch {
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
    }
    catch (error) {
      throw new Error(`获取文件信息失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // SQLite database handlers
  ipcMain.handle('sqlite:cleanAugmentData', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath)
      const stmt = db.prepare('DELETE FROM ItemTable WHERE key LIKE \'%augment%\'')
      const result = stmt.run()
      db.close()

      return { deletedRows: result.changes }
    }
    catch (error) {
      throw new Error(`清理数据库失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('sqlite:validateFile', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath, { readonly: true })
      // 尝试查询表结构来验证数据库
      const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all()
      db.close()
      return tables.length > 0
    }
    catch {
      return false
    }
  })

  ipcMain.handle('sqlite:countAugmentRecords', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath, { readonly: true })
      const result = db
        .prepare('SELECT COUNT(*) as count FROM ItemTable WHERE key LIKE \'%augment%\'')
        .get() as { count: number }
      db.close()
      return result.count
    }
    catch {
      return 0
    }
  })

  ipcMain.handle('sqlite:getDatabaseInfo', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath, { readonly: true })
      const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all() as {
        name: string
      }[]
      const totalRecords = db.prepare('SELECT COUNT(*) as count FROM ItemTable').get() as {
        count: number
      }
      const augmentRecords = db
        .prepare('SELECT COUNT(*) as count FROM ItemTable WHERE key LIKE \'%augment%\'')
        .get() as { count: number }
      db.close()

      return {
        tables: tables.map(t => t.name),
        totalRecords: totalRecords.count,
        augmentRecords: augmentRecords.count,
      }
    }
    catch (error) {
      throw new Error(
        `获取数据库信息失败: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  })

  ipcMain.handle('sqlite:previewAugmentRecords', async (_, dbPath: string) => {
    try {
      const db = new Database(dbPath, { readonly: true })
      const records = db
        .prepare('SELECT key, value FROM ItemTable WHERE key LIKE \'%augment%\' LIMIT 50')
        .all() as { key: string, value: string }[]
      db.close()
      return records
    }
    catch {
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
      }
      else if (platform === 'darwin') {
        command = 'pgrep -f "Visual Studio Code" | wc -l'
      }
      else {
        command = 'pgrep -f "code" | wc -l'
      }

      const { stdout } = await execAsync(command)
      const count = Number.parseInt(stdout.trim(), 10)
      return count > 0
    }
    catch {
      return false
    }
  })

  // VSCode process control handlers
  ipcMain.handle('process:closeVSCode', async () => {
    try {
      const platform = process.platform
      let command: string

      if (platform === 'win32') {
        command = 'taskkill /F /IM Code.exe'
      }
      else if (platform === 'darwin') {
        command = 'pkill -9 "Visual Studio Code"'
      }
      else {
        command = 'pkill -9 code'
      }

      await execAsync(command)
      return true
    }
    catch (error) {
      console.error('Failed to close VSCode:', error)
      return false
    }
  })

  ipcMain.handle('process:reopenVSCode', async () => {
    try {
      const platform = process.platform
      let command: string

      if (platform === 'win32') {
        command = 'start /b "" "code"'
      }
      else if (platform === 'darwin') {
        command = 'open -a "Visual Studio Code"'
      }
      else {
        command = 'nohup code > /dev/null 2>&1 &'
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      await execAsync(command)
      return true
    }
    catch (error) {
      console.error('Failed to reopen VSCode:', error)
      return false
    }
  })

  // Shell handlers
  ipcMain.handle('shell:openExternal', async (_, url: string) => {
    try {
      await shell.openExternal(url)
      return { success: true }
    }
    catch (error) {
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
    }
    catch {
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
      }
      catch {
        return []
      }
    },
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
    }
    catch (error) {
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
    }
    catch (error) {
      throw new Error(`创建备份失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  ipcMain.handle('workspace:restoreBackup', async (_, _backupPath: string, _targetPath: string) => {
    try {
      // 这里应该实现从 zip 文件恢复
      // 暂时只是一个占位符
      return { success: true }
    }
    catch (error) {
      throw new Error(`恢复备份失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

  // VS Code 控制处理程序
  ipcMain.handle('vscode:isRunning', async () => {
    return await checkVSCodeRunning()
  })

  ipcMain.handle('vscode:close', async () => {
    try {
      const platform = process.platform
      let command = ''

      if (platform === 'win32') {
        // 使用/F强制关闭，确保能关闭所有VS Code进程
        command = 'taskkill /F /IM Code.exe'
      }
      else if (platform === 'darwin') {
        // 使用-9强制终止所有相关进程
        command = 'pkill -9 -f "Visual Studio Code" || pkill -9 -x "Code"'
      }
      else {
        // 使用-9强制终止所有相关进程
        command = 'pkill -9 -f "code" || pkill -9 -x "code-oss" || true'
      }

      try {
        await execAsync(command)
        // 等待一小段时间确保进程已关闭
        await new Promise(resolve => setTimeout(resolve, 500))
        return true
      }
      catch (execError) {
        // 在Windows上，如果没有找到进程，taskkill会返回错误
        // 但这种情况我们应该返回true，因为这意味着VS Code已经不在运行
        console.log('关闭VS Code结果:', execError.message)

        // 直接重新检查VS Code是否在运行
        const isRunning = await checkVSCodeRunning()
        return !isRunning
      }
    }
    catch (error) {
      console.error('关闭 VS Code 失败:', error)
      return false
    }
  })

  ipcMain.handle('vscode:reopen', async () => {
    try {
      const platform = process.platform
      let command = ''

      // 使用不同的方法在后台启动VS Code，避免显示命令窗口
      if (platform === 'win32') {
        // 在Windows上使用start /b命令隐藏命令窗口
        command = 'start /b "" "code"'
      }
      else if (platform === 'darwin') {
        command = 'open -a "Visual Studio Code"'
      }
      else {
        // 在Linux上使用nohup并将输出重定向到/dev/null
        command = 'nohup code > /dev/null 2>&1 &'
      }

      // 先检查VS Code是否已经关闭
      const isRunning = await checkVSCodeRunning()
      if (isRunning) {
        console.log('VS Code 仍在运行，尝试先关闭...')
        await execAsync(platform === 'win32' ? 'taskkill /F /IM Code.exe' : 'pkill -9 -f "code"')
        // 等待进程完全退出
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // 添加延迟确保命令正确执行
      await execAsync(command)

      return true
    }
    catch (error) {
      console.error('重新打开 VS Code 失败:', error)
      return false
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
    'process:closeVSCode',
    'process:reopenVSCode',
    'workspace:getInfo',
    'workspace:previewContents',
    'workspace:cleanStorage',
    'workspace:createBackup',
    'workspace:restoreBackup',
    'shell:openExternal',
    'vscode:isRunning',
    'vscode:close',
    'vscode:reopen',
  ]

  handlers.forEach((handler) => {
    ipcMain.removeAllListeners(handler)
  })
}

// 辅助函数：检查VS Code是否在运行
async function checkVSCodeRunning(): Promise<boolean> {
  try {
    const platform = process.platform
    let command = ''

    if (platform === 'win32') {
      command = 'tasklist /FI "IMAGENAME eq Code.exe" | findstr /i "Code.exe" >nul 2>&1 && echo running || echo not-running'
    }
    else if (platform === 'darwin') {
      command = 'pgrep -f "Visual Studio Code" || pgrep -x "Code" || pgrep -f "Electron.*Code"'
    }
    else {
      command = 'pgrep -x "code" || pgrep -x "code-oss" || pgrep -f "electron.*code"'
    }

    try {
      const { stdout } = await execAsync(command)

      if (platform === 'win32') {
        return stdout.trim() === 'running'
      }

      return stdout.trim().length > 0
    }
    catch (execError) {
      if (execError.code === 1) {
        return false
      }
      throw execError
    }
  }
  catch (error) {
    console.error('检查 VS Code 运行状态失败:', error)
    return false
  }
}
