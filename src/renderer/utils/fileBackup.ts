/**
 * 文件备份工具类 - 渲染进程版本，通过 IPC 调用主进程
 */
export class FileBackup {
  /**
   * 创建文件备份，使用时间戳命名
   * 格式: <filename>.bak.<timestamp>
   */
  static async createBackup(filePath: string): Promise<string> {
    // 检查文件是否存在
    const exists = await window.electronAPI.fileExists(filePath)
    if (!exists) {
      throw new Error(`文件不存在: ${filePath}`)
    }

    // 生成备份文件路径
    const timestamp = Math.floor(Date.now() / 1000)
    const backupPath = `${filePath}.bak.${timestamp}`

    try {
      // 复制文件
      await window.electronAPI.copyFile(filePath, backupPath)
      return backupPath
    } catch (error) {
      throw new Error(`创建备份失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 创建多个文件的备份
   */
  static async createMultipleBackups(filePaths: string[]): Promise<{ [filePath: string]: string }> {
    const backups: { [filePath: string]: string } = {}
    const errors: string[] = []

    for (const filePath of filePaths) {
      try {
        const backupPath = await this.createBackup(filePath)
        backups[filePath] = backupPath
      } catch (error) {
        errors.push(`${filePath}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    if (errors.length > 0) {
      throw new Error(`部分文件备份失败:\n${errors.join('\n')}`)
    }

    return backups
  }

  /**
   * 检查文件是否存在
   */
  static async fileExists(filePath: string): Promise<boolean> {
    return await window.electronAPI.fileExists(filePath)
  }

  /**
   * 生成备份文件名（不实际创建文件）
   */
  static generateBackupPath(filePath: string, timestamp?: number): string {
    const ts = timestamp || Math.floor(Date.now() / 1000)
    return `${filePath}.bak.${ts}`
  }

  /**
   * 解析备份文件信息
   */
  static parseBackupPath(backupPath: string): { originalPath: string; timestamp: number } | null {
    const match = backupPath.match(/^(.+)\.bak\.(\d+)$/)
    if (!match) {
      return null
    }

    return {
      originalPath: match[1],
      timestamp: parseInt(match[2], 10)
    }
  }

  /**
   * 获取文件的所有备份
   */
  static getBackupInfo(_filePath: string): {
    originalPath: string
    backupPath: string
    timestamp: number
    date: Date
  }[] {
    // 这个方法需要在主进程中实现，因为需要读取目录
    // 这里只是定义接口
    return []
  }
}
