import { PathManager } from '../utils/pathManager'
import { FileBackup } from '../utils/fileBackup'

/**
 * 工作区清理器服务 - 备份并清理工作区存储目录
 */
export interface WorkspaceCleanResult {
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
}

export class WorkspaceCleanerService {
  /**
   * 清理工作区存储
   * 1. 获取工作区存储路径
   * 2. 创建所有文件的 zip 备份
   * 3. 删除目录中的所有文件
   */
  static async cleanWorkspaceStorage(workspacePath?: string): Promise<WorkspaceCleanResult> {
    const finalWorkspacePath = workspacePath || await PathManager.getWorkspaceStoragePath()

    // 检查工作区目录是否存在
    if (!(await FileBackup.fileExists(finalWorkspacePath))) {
      throw new Error(`工作区存储目录未找到: ${finalWorkspacePath}`)
    }

    try {
      // 通过 IPC 调用主进程的工作区清理操作
      const result = await window.electronAPI.cleanWorkspaceStorage(finalWorkspacePath)
      
      return result
    } catch (error) {
      throw new Error(`清理工作区失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 获取工作区存储信息
   */
  static async getWorkspaceInfo(workspacePath?: string): Promise<{
    exists: boolean
    totalFiles: number
    totalDirectories: number
    totalSize: number
  }> {
    const path = workspacePath || await PathManager.getWorkspaceStoragePath()
    
    try {
      const info = await window.electronAPI.getWorkspaceInfo(path)
      return info
    } catch {
      return {
        exists: false,
        totalFiles: 0,
        totalDirectories: 0,
        totalSize: 0
      }
    }
  }

  /**
   * 预览工作区内容
   */
  static async previewWorkspaceContents(workspacePath?: string, maxItems: number = 100): Promise<Array<{
    name: string
    type: 'file' | 'directory'
    size: number
    path: string
  }>> {
    const path = workspacePath || await PathManager.getWorkspaceStoragePath()
    
    try {
      if (!(await FileBackup.fileExists(path))) {
        return []
      }

      const contents = await window.electronAPI.previewWorkspaceContents(path, maxItems)
      return contents
    } catch {
      return []
    }
  }

  /**
   * 验证工作区目录
   */
  static async validateWorkspaceDirectory(workspacePath?: string): Promise<boolean> {
    const path = workspacePath || await PathManager.getWorkspaceStoragePath()
    
    try {
      const info = await this.getWorkspaceInfo(path)
      return info.exists
    } catch {
      return false
    }
  }

  /**
   * 创建工作区备份（不删除原文件）
   */
  static async createWorkspaceBackup(workspacePath?: string): Promise<string> {
    const path = workspacePath || await PathManager.getWorkspaceStoragePath()

    if (!(await FileBackup.fileExists(path))) {
      throw new Error(`工作区存储目录未找到: ${path}`)
    }

    try {
      const backupPath = await window.electronAPI.createWorkspaceBackup(path)
      return backupPath
    } catch (error) {
      throw new Error(`创建工作区备份失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 恢复工作区备份
   */
  static async restoreWorkspaceBackup(backupPath: string, targetPath?: string): Promise<void> {
    const target = targetPath || await PathManager.getWorkspaceStoragePath()

    try {
      await window.electronAPI.restoreWorkspaceBackup(backupPath, target)
    } catch (error) {
      throw new Error(`恢复工作区备份失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
