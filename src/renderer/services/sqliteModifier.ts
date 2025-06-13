import { PathManager } from '../utils/pathManager'
import { FileBackup } from '../utils/fileBackup'

/**
 * SQLite 修改器服务 - 清理 SQLite 数据库中包含 'augment' 的记录
 */
export interface DatabaseCleanResult {
  dbBackupPath: string
  deletedRows: number
}

export class SqliteModifierService {
  /**
   * 清理 augment 相关数据
   * 1. 获取 SQLite 数据库路径
   * 2. 创建数据库文件备份
   * 3. 打开数据库连接
   * 4. 删除键包含 'augment' 的记录
   */
  static async cleanAugmentData(): Promise<DatabaseCleanResult> {
    const dbPath = await PathManager.getDbPath()

    // 检查数据库文件是否存在
    if (!(await FileBackup.fileExists(dbPath))) {
      throw new Error(`数据库文件未找到: ${dbPath}`)
    }

    // 创建备份
    const dbBackupPath = await FileBackup.createBackup(dbPath)

    try {
      // 通过 IPC 调用主进程的数据库操作
      const result = await window.electronAPI.cleanSqliteData(dbPath)
      
      return {
        dbBackupPath,
        deletedRows: result.deletedRows
      }
    } catch (error) {
      // 如果出错，尝试恢复备份
      try {
        await window.electronAPI.copyFile(dbBackupPath, dbPath)
      } catch (restoreError) {
        console.error('恢复数据库备份失败:', restoreError)
      }
      
      throw new Error(`清理数据库失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 验证数据库文件
   */
  static async validateDatabase(filePath?: string): Promise<boolean> {
    const path = filePath || await PathManager.getDbPath()
    
    try {
      if (!(await FileBackup.fileExists(path))) {
        return false
      }

      // 通过 IPC 验证数据库文件
      const isValid = await window.electronAPI.validateSqliteFile(path)
      return isValid
    } catch {
      return false
    }
  }

  /**
   * 获取数据库中包含 'augment' 的记录数量
   */
  static async getAugmentRecordsCount(filePath?: string): Promise<number> {
    const path = filePath || await PathManager.getDbPath()
    
    try {
      if (!(await FileBackup.fileExists(path))) {
        return 0
      }

      const count = await window.electronAPI.countAugmentRecords(path)
      return count
    } catch {
      return 0
    }
  }

  /**
   * 获取数据库表信息
   */
  static async getDatabaseInfo(filePath?: string): Promise<{
    tables: string[]
    totalRecords: number
    augmentRecords: number
  } | null> {
    const path = filePath || await PathManager.getDbPath()
    
    try {
      if (!(await FileBackup.fileExists(path))) {
        return null
      }

      const info = await window.electronAPI.getDatabaseInfo(path)
      return info
    } catch {
      return null
    }
  }

  /**
   * 预览将要删除的记录
   */
  static async previewAugmentRecords(filePath?: string): Promise<Array<{ key: string; value: string }>> {
    const path = filePath || await PathManager.getDbPath()
    
    try {
      if (!(await FileBackup.fileExists(path))) {
        return []
      }

      const records = await window.electronAPI.previewAugmentRecords(path)
      return records
    } catch {
      return []
    }
  }
}
