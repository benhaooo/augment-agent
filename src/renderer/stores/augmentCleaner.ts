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

export const useAugmentCleanerStore = defineStore('augmentCleaner', () => {
  // 状态
  const isLoading = ref(false)
  const isChecking = ref(false)
  const isCleaning = ref(false)
  const systemStatus = ref<SystemStatus | null>(null)
  const riskAssessment = ref<RiskAssessment | null>(null)
  const cleaningProgress = ref<CleaningProgress | null>(null)
  const lastCleanResult = ref<AugmentCleanResult | null>(null)
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
    isCleaning.value = true
    error.value = null
    cleaningProgress.value = null
    
    try {
      const result = await AugmentCleanerService.performFullClean((progress) => {
        cleaningProgress.value = progress
      })
      
      lastCleanResult.value = result
      
      // 清理完成后重新检查系统状态
      await checkSystemStatus()
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '清理操作失败'
      console.error('清理操作失败:', err)
      throw err
    } finally {
      isCleaning.value = false
      cleaningProgress.value = null
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

  const clearError = () => {
    error.value = null
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
    clearError,
    reset,
    initialize
  }
})
