import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AugmentCleanerService, type AugmentCleanResult, type CleaningProgress } from '../services/augmentCleaner'

export interface SystemStatus {
  storageFileExists: boolean
  databaseFileExists: boolean
  workspaceDirectoryExists: boolean
  currentTelemetryIds: { machineId: string; deviceId: string } | null
  databaseInfo: { tables: string[]; totalRecords: number; augmentRecords: number } | null
  workspaceInfo: { exists: boolean; totalFiles: number; totalDirectories: number; totalSize: number }
  systemPaths: {
    homeDir: string
    appDataDir: string
    vscodeConfigDir: string
    storagePath: string
    dbPath: string
    machineIdPath: string
    workspaceStoragePath: string
  }
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high'
  warnings: string[]
  recommendations: string[]
}

// 扩展AugmentCleanResult接口
export interface ExtendedCleanResult extends AugmentCleanResult {
  timestamp: string
  success: boolean
}

export const useAugmentCleanerStore = defineStore('augmentCleaner', () => {
  // 状态
  const isLoading = ref(false)
  const isChecking = ref(false)
  const isCleaning = ref(false)
  const systemStatus = ref<SystemStatus | null>(null)
  const riskAssessment = ref<RiskAssessment | null>(null)
  const cleaningProgress = ref<CleaningProgress | null>(null)
  const lastCleanResult = ref<ExtendedCleanResult | null>(null)
  const error = ref<string | null>(null)

  // 计算属性
  const canPerformClean = computed(() => {
    if (!systemStatus.value) return false
    return systemStatus.value.storageFileExists || 
           systemStatus.value.databaseFileExists || 
           systemStatus.value.workspaceDirectoryExists
  })

  const isHighRisk = computed(() => {
    return riskAssessment.value?.riskLevel === 'high'
  })

  const hasWarnings = computed(() => {
    return (riskAssessment.value?.warnings?.length || 0) > 0
  })

  // 操作方法
  const checkSystemStatus = async () => {
    isChecking.value = true
    error.value = null
    
    try {
      systemStatus.value = await AugmentCleanerService.checkSystemStatus()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '检查系统状态失败'
      console.error('检查系统状态失败:', err)
    } finally {
      isChecking.value = false
    }
  }

  const assessRisk = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      riskAssessment.value = await AugmentCleanerService.getRiskAssessment()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '风险评估失败'
      console.error('风险评估失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  const performFullClean = async () => {
    try {
      isCleaning.value = true
      cleaningProgress.value = {
        step: 'preparing',
        message: '准备清理操作...',
        percentage: 0
      }

      // 创建备份
      cleaningProgress.value = {
        step: 'backup',
        message: '创建数据备份...',
        percentage: 10
      }

      // 处理遥测 ID
      cleaningProgress.value = {
        step: 'telemetry',
        message: '修改遥测 ID...',
        percentage: 30
      }
      const telemetryResult = await cleanTelemetry()

      // 处理 SQLite 数据库
      cleaningProgress.value = {
        step: 'database',
        message: '清理数据库记录...',
        percentage: 50
      }
      const databaseResult = await cleanDatabase()

      // 处理工作区
      cleaningProgress.value = {
        step: 'workspace',
        message: '清理工作区存储...',
        percentage: 70
      }
      const workspaceResult = await cleanWorkspace()

      // 完成所有操作
      cleaningProgress.value = {
        step: 'finalizing',
        message: '完成清理操作...',
        percentage: 90
      }

      // 更新结果
      lastCleanResult.value = {
        telemetryResult,
        databaseResult,
        workspaceResult,
        timestamp: new Date().toISOString(),
        success: true,
        systemPaths: systemStatus.value?.systemPaths || {
          homeDir: '',
          appDataDir: '',
          vscodeConfigDir: '',
          storagePath: '',
          dbPath: '',
          machineIdPath: '',
          workspaceStoragePath: ''
        }
      }

      // 更新状态为已完成
      cleaningProgress.value = {
        step: 'completed',
        message: '清理操作已完成，准备重启 VS Code...',
        percentage: 100
      }

      return lastCleanResult.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '清理操作失败'
      lastCleanResult.value = null
      return null
    } finally {
      setTimeout(() => {
        isCleaning.value = false
      }, 1000) // 保持进度条显示1秒
    }
  }

  const previewOperations = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const preview = await AugmentCleanerService.previewOperations()
      return preview
    } catch (err) {
      error.value = err instanceof Error ? err.message : '预览操作失败'
      console.error('预览操作失败:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const checkVSCodeRunning = async () => {
    try {
      return await AugmentCleanerService.isVSCodeRunning()
    } catch (err) {
      console.error('检查 VS Code 运行状态失败:', err)
      return false
    }
  }

  const closeVSCode = async () => {
    try {
      return await window.electronAPI.closeVSCode()
    } catch (err) {
      console.error('关闭 VS Code 失败:', err)
      return false
    }
  }

  const reopenVSCode = async () => {
    try {
      return await window.electronAPI.reopenVSCode()
    } catch (err) {
      console.error('重新打开 VS Code 失败:', err)
      return false
    }
  }

  const cleanTelemetry = async () => {
    try {
      if (!systemStatus.value?.systemPaths.storagePath) {
        throw new Error('Storage 文件路径未找到')
      }

      // 从 AugmentCleanerService 调用相应的清理方法
      return await AugmentCleanerService.cleanTelemetryIds(systemStatus.value.systemPaths.storagePath)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '清理遥测 ID 失败'
      throw err
    }
  }

  const cleanDatabase = async () => {
    try {
      if (!systemStatus.value?.systemPaths.dbPath) {
        throw new Error('数据库文件路径未找到')
      }

      // 从 AugmentCleanerService 调用相应的清理方法
      return await AugmentCleanerService.cleanDatabase(systemStatus.value.systemPaths.dbPath)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '清理数据库失败'
      throw err
    }
  }

  const cleanWorkspace = async () => {
    try {
      if (!systemStatus.value?.systemPaths.workspaceStoragePath) {
        throw new Error('工作区路径未找到')
      }

      // 从 AugmentCleanerService 调用相应的清理方法
      return await AugmentCleanerService.cleanWorkspace(systemStatus.value.systemPaths.workspaceStoragePath)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '清理工作区失败'
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const setLoading = (status: boolean) => {
    isLoading.value = status
  }

  const reset = () => {
    isLoading.value = false
    isChecking.value = false
    isCleaning.value = false
    systemStatus.value = null
    riskAssessment.value = null
    cleaningProgress.value = null
    lastCleanResult.value = null
    error.value = null
  }

  // 初始化
  const initialize = async () => {
    await checkSystemStatus()
    await assessRisk()
  }

  return {
    // 状态
    isLoading,
    isChecking,
    isCleaning,
    systemStatus,
    riskAssessment,
    cleaningProgress,
    lastCleanResult,
    error,
    
    // 计算属性
    canPerformClean,
    isHighRisk,
    hasWarnings,
    
    // 方法
    checkSystemStatus,
    assessRisk,
    performFullClean,
    previewOperations,
    checkVSCodeRunning,
    closeVSCode,
    reopenVSCode,
    cleanTelemetry,
    cleanDatabase,
    cleanWorkspace,
    clearError,
    setLoading,
    reset,
    initialize
  }
})
