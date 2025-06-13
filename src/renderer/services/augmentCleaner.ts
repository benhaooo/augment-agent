import { PathManager } from '../utils/pathManager'
import { JsonModifierService, type TelemetryModificationResult } from './jsonModifier'
import { SqliteModifierService, type DatabaseCleanResult } from './sqliteModifier'
import { WorkspaceCleanerService, type WorkspaceCleanResult } from './workspaceCleaner'

/**
 * AugmentCode 清理器主服务 - 协调所有清理操作
 */
export interface AugmentCleanResult {
  telemetryResult: TelemetryModificationResult
  databaseResult: DatabaseCleanResult
  workspaceResult: WorkspaceCleanResult
  systemPaths: Awaited<ReturnType<typeof PathManager.getAllPaths>>
}

export interface CleaningProgress {
  step: 'telemetry' | 'database' | 'workspace' | 'complete'
  message: string
  progress: number // 0-100
}

export class AugmentCleanerService {
  /**
   * 执行完整的 AugmentCode 清理流程
   */
  static async performFullClean(
    onProgress?: (progress: CleaningProgress) => void
  ): Promise<AugmentCleanResult> {
    const systemPaths = await PathManager.getAllPaths()

    try {
      // 步骤 1: 修改遥测 ID
      onProgress?.({
        step: 'telemetry',
        message: '正在修改遥测 ID...',
        progress: 10,
      })

      const telemetryResult = await JsonModifierService.modifyTelemetryIds()

      onProgress?.({
        step: 'telemetry',
        message: '遥测 ID 修改完成',
        progress: 33,
      })

      // 步骤 2: 清理 SQLite 数据库
      onProgress?.({
        step: 'database',
        message: '正在清理 SQLite 数据库...',
        progress: 40,
      })

      const databaseResult = await SqliteModifierService.cleanAugmentData()

      onProgress?.({
        step: 'database',
        message: '数据库清理完成',
        progress: 66,
      })

      // 步骤 3: 清理工作区存储
      onProgress?.({
        step: 'workspace',
        message: '正在清理工作区存储...',
        progress: 70,
      })

      const workspaceResult = await WorkspaceCleanerService.cleanWorkspaceStorage()

      onProgress?.({
        step: 'complete',
        message: '所有清理操作完成',
        progress: 100,
      })

      return {
        telemetryResult,
        databaseResult,
        workspaceResult,
        systemPaths,
      }
    } catch (error) {
      throw new Error(`清理操作失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 检查系统环境和文件状态
   */
  static async checkSystemStatus(): Promise<{
    storageFileExists: boolean
    databaseFileExists: boolean
    workspaceDirectoryExists: boolean
    currentTelemetryIds: { machineId: string; deviceId: string } | null
    databaseInfo: { tables: string[]; totalRecords: number; augmentRecords: number } | null
    workspaceInfo: {
      exists: boolean
      totalFiles: number
      totalDirectories: number
      totalSize: number
    }
    systemPaths: Awaited<ReturnType<typeof PathManager.getAllPaths>>
  }> {
    const systemPaths = await PathManager.getAllPaths()

    const [
      storageFileExists,
      databaseFileExists,
      workspaceDirectoryExists,
      currentTelemetryIds,
      databaseInfo,
      workspaceInfo,
    ] = await Promise.all([
      JsonModifierService.validateStorageFile(),
      SqliteModifierService.validateDatabase(),
      WorkspaceCleanerService.validateWorkspaceDirectory(),
      JsonModifierService.getCurrentTelemetryIds(),
      SqliteModifierService.getDatabaseInfo(),
      WorkspaceCleanerService.getWorkspaceInfo(),
    ])

    return {
      storageFileExists,
      databaseFileExists,
      workspaceDirectoryExists,
      currentTelemetryIds,
      databaseInfo,
      workspaceInfo,
      systemPaths,
    }
  }

  /**
   * 预览将要执行的操作
   */
  static async previewOperations(): Promise<{
    telemetryChanges: { machineId: string; deviceId: string } | null
    databaseRecords: Array<{ key: string; value: string }>
    workspaceContents: Array<{
      name: string
      type: 'file' | 'directory'
      size: number
      path: string
    }>
  }> {
    const [currentTelemetryIds, databaseRecords, workspaceContents] = await Promise.all([
      JsonModifierService.getCurrentTelemetryIds(),
      SqliteModifierService.previewAugmentRecords(),
      WorkspaceCleanerService.previewWorkspaceContents(),
    ])

    return {
      telemetryChanges: currentTelemetryIds,
      databaseRecords,
      workspaceContents,
    }
  }

  /**
   * 验证 VS Code 是否正在运行
   */
  static async isVSCodeRunning(): Promise<boolean> {
    try {
      const isRunning = await window.electronAPI.isVSCodeRunning()
      return isRunning
    } catch {
      return false
    }
  }

  /**
   * 获取清理操作的风险评估
   */
  static async getRiskAssessment(): Promise<{
    riskLevel: 'low' | 'medium' | 'high'
    warnings: string[]
    recommendations: string[]
  }> {
    const status = await this.checkSystemStatus()
    const isVSCodeRunning = await this.isVSCodeRunning()

    const warnings: string[] = []
    const recommendations: string[] = []
    let riskLevel: 'low' | 'medium' | 'high' = 'low'

    if (isVSCodeRunning) {
      warnings.push('VS Code 正在运行，可能导致操作失败')
      recommendations.push('请先完全退出 VS Code')
      riskLevel = 'high'
    }

    if (!status.storageFileExists) {
      warnings.push('未找到 VS Code storage.json 文件')
      riskLevel = 'medium'
    }

    if (!status.databaseFileExists) {
      warnings.push('未找到 VS Code 数据库文件')
      riskLevel = 'medium'
    }

    if (!status.workspaceDirectoryExists) {
      warnings.push('未找到工作区存储目录')
    }

    if (status.databaseInfo && status.databaseInfo.augmentRecords === 0) {
      warnings.push('数据库中未找到 augment 相关记录')
    }

    recommendations.push('操作前会自动创建所有文件的备份')
    recommendations.push('建议在操作前手动备份重要的 VS Code 配置')

    return {
      riskLevel,
      warnings,
      recommendations,
    }
  }
}
