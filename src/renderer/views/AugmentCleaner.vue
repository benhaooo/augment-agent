<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 页面标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Free AugmentCode</h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">
          清理 AugmentCode 相关数据，支持无限次登录不同账号
        </p>
      </div>

      <!-- 错误提示 -->
      <div v-if="store.error" class="mb-6">
        <div
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">操作失败</h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                {{ store.error }}
              </div>
              <div class="mt-3">
                <button
                  @click="store.clearError"
                  class="text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 风险警告 -->
      <div v-if="store.riskAssessment && store.hasWarnings" class="mb-6">
        <div
          class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                ></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                风险等级: {{ riskLevelText }}
              </h3>
              <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <ul class="list-disc list-inside space-y-1">
                  <li v-for="warning in store.riskAssessment.warnings" :key="warning">
                    {{ warning }}
                  </li>
                </ul>
              </div>
              <div v-if="store.riskAssessment.recommendations.length > 0" class="mt-3">
                <h4 class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">建议:</h4>
                <ul
                  class="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1"
                >
                  <li
                    v-for="recommendation in store.riskAssessment.recommendations"
                    :key="recommendation"
                  >
                    {{ recommendation }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：系统状态和路径信息 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 系统状态 -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              系统状态
            </h3>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-300">Storage 文件</span>
                <StatusBadge :exists="store.systemStatus?.storageFileExists" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-300">数据库文件</span>
                <StatusBadge :exists="store.systemStatus?.databaseFileExists" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-300">工作区目录</span>
                <StatusBadge :exists="store.systemStatus?.workspaceDirectoryExists" />
              </div>
            </div>

            <!-- 当前遥测 ID -->
            <div
              v-if="store.systemStatus?.currentTelemetryIds"
              class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">当前遥测 ID</h4>
              <div class="space-y-2 text-xs">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">机器 ID:</span>
                  <p class="font-mono text-gray-900 dark:text-white break-all">
                    {{ store.systemStatus?.currentTelemetryIds?.machineId || '未知' }}
                  </p>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">设备 ID:</span>
                  <p class="font-mono text-gray-900 dark:text-white break-all">
                    {{ store.systemStatus?.currentTelemetryIds?.deviceId || '未知' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 数据库信息 -->
            <div
              v-if="store.systemStatus?.databaseInfo"
              class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">数据库信息</h4>
              <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <div>总记录数: {{ store.systemStatus?.databaseInfo?.totalRecords || 0 }}</div>
                <div>
                  Augment 记录数: {{ store.systemStatus?.databaseInfo?.augmentRecords || 0 }}
                </div>
              </div>
            </div>

            <!-- 工作区信息 -->
            <div
              v-if="store.systemStatus?.workspaceInfo"
              class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">工作区信息</h4>
              <div class="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <div>存在: {{ store.systemStatus?.workspaceInfo?.exists ? '是' : '否' }}</div>
                <div>文件数: {{ store.systemStatus?.workspaceInfo?.totalFiles || 0 }}</div>
                <div>目录数: {{ store.systemStatus?.workspaceInfo?.totalDirectories || 0 }}</div>
                <div>
                  总大小: {{ formatFileSize(store.systemStatus?.workspaceInfo?.totalSize || 0) }}
                </div>
              </div>
            </div>

            <!-- 刷新按钮 -->
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                @click="refreshStatus"
                :disabled="store.isChecking"
                class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="store.isChecking">检查中...</span>
                <span v-else>刷新状态</span>
              </button>
            </div>
          </div>

          <!-- 路径信息 -->
          <PathDisplay
            v-if="store.systemStatus?.systemPaths"
            :paths="store.systemStatus.systemPaths"
            :file-status="{
              storageExists: store.systemStatus.storageFileExists,
              databaseExists: store.systemStatus.databaseFileExists,
              workspaceExists: store.systemStatus.workspaceDirectoryExists,
            }"
          />
        </div>

        <!-- 右侧：操作区域 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 清理进度 -->
          <ProgressIndicator
            v-if="store.isCleaning || store.cleaningProgress"
            :progress="store.cleaningProgress"
            :is-complete="!store.isCleaning && store.lastCleanResult !== null"
          />

          <!-- 操作卡片 -->
          <div v-if="!store.isCleaning" class="space-y-4">
            <!-- 遥测 ID 修改 -->
            <OperationCard
              title="修改遥测 ID"
              description="重置设备 ID 和机器 ID，生成新的随机标识符"
              type="info"
              icon="telemetry"
              :status="store.systemStatus?.storageFileExists ? '就绪' : '文件不存在'"
              :details="[
                {
                  label: '当前机器 ID',
                  value:
                    store.systemStatus?.currentTelemetryIds?.machineId?.substring(0, 16) + '...' ||
                    '未知',
                },
                {
                  label: '当前设备 ID',
                  value: store.systemStatus?.currentTelemetryIds?.deviceId || '未知',
                },
              ]"
            >
              <template #actions>
                <button
                  @click="previewTelemetryChanges"
                  :disabled="!store.systemStatus?.storageFileExists"
                  class="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  预览
                </button>
              </template>
            </OperationCard>

            <!-- 数据库清理 -->
            <OperationCard
              title="清理 SQLite 数据库"
              description="删除数据库中包含 'augment' 关键字的记录"
              type="warning"
              icon="database"
              :status="store.systemStatus?.databaseFileExists ? '就绪' : '文件不存在'"
              :details="[
                {
                  label: '待删除记录',
                  value: store.systemStatus?.databaseInfo?.augmentRecords || 0,
                },
                { label: '总记录数', value: store.systemStatus?.databaseInfo?.totalRecords || 0 },
              ]"
            >
              <template #actions>
                <button
                  @click="previewDatabaseChanges"
                  :disabled="!store.systemStatus?.databaseFileExists"
                  class="text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  预览
                </button>
              </template>
            </OperationCard>

            <!-- 工作区清理 -->
            <OperationCard
              title="清理工作区存储"
              description="备份并清理工作区存储目录中的所有文件"
              type="error"
              icon="workspace"
              :status="store.systemStatus?.workspaceDirectoryExists ? '就绪' : '目录不存在'"
              :details="[
                { label: '文件数量', value: store.systemStatus?.workspaceInfo?.totalFiles || 0 },
                {
                  label: '目录数量',
                  value: store.systemStatus?.workspaceInfo?.totalDirectories || 0,
                },
                {
                  label: '总大小',
                  value: formatFileSize(store.systemStatus?.workspaceInfo?.totalSize || 0),
                },
              ]"
            >
              <template #actions>
                <button
                  @click="previewWorkspaceChanges"
                  :disabled="!store.systemStatus?.workspaceDirectoryExists"
                  class="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  预览
                </button>
              </template>
            </OperationCard>
          </div>

          <!-- 主要操作按钮 -->
          <div v-if="!store.isCleaning" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div class="text-center">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">执行清理操作</h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
                点击下方按钮开始清理 AugmentCode 相关数据。操作前会自动创建备份。
              </p>

              <div class="space-y-3">
                <button
                  @click="startCleaning"
                  :disabled="!store.canPerformClean || store.isHighRisk"
                  class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <span v-if="store.isLoading">准备中...</span>
                  <span v-else>开始清理</span>
                </button>

                <button
                  @click="previewAllChanges"
                  :disabled="!store.canPerformClean"
                  class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  预览所有更改
                </button>
              </div>
            </div>
          </div>

          <!-- 清理结果 -->
          <div
            v-if="store.lastCleanResult && !store.isCleaning"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg
                class="w-5 h-5 mr-2 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              清理完成
            </h3>

            <div class="space-y-4 text-sm">
              <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <h4 class="font-medium text-green-800 dark:text-green-200 mb-2">
                  遥测 ID 修改结果
                </h4>
                <div class="space-y-1 text-green-700 dark:text-green-300">
                  <div>
                    新机器 ID:
                    {{ store.lastCleanResult.telemetryResult.newMachineId.substring(0, 16) }}...
                  </div>
                  <div>新设备 ID: {{ store.lastCleanResult.telemetryResult.newDeviceId }}</div>
                  <div>备份文件: {{ store.lastCleanResult.telemetryResult.storageBackupPath }}</div>
                </div>
              </div>

              <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  数据库清理结果
                </h4>
                <div class="space-y-1 text-yellow-700 dark:text-yellow-300">
                  <div>删除记录数: {{ store.lastCleanResult.databaseResult.deletedRows }}</div>
                  <div>备份文件: {{ store.lastCleanResult.databaseResult.dbBackupPath }}</div>
                </div>
              </div>

              <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                <h4 class="font-medium text-red-800 dark:text-red-200 mb-2">工作区清理结果</h4>
                <div class="space-y-1 text-red-700 dark:text-red-300">
                  <div>
                    删除文件数: {{ store.lastCleanResult.workspaceResult.deletedFilesCount }}
                  </div>
                  <div>备份文件: {{ store.lastCleanResult.workspaceResult.backupPath }}</div>
                </div>
              </div>
            </div>

            <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">下一步操作</h4>
              <p class="text-blue-700 dark:text-blue-300 text-sm">
                现在可以重新启动 VS Code，然后在 AugmentCode 插件中使用新的邮箱进行登录。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAugmentCleanerStore } from '../stores/augmentCleaner'
import PathDisplay from '../components/PathDisplay.vue'
import OperationCard from '../components/OperationCard.vue'
import ProgressIndicator from '../components/ProgressIndicator.vue'
import StatusBadge from '../components/StatusBadge.vue'

// 状态管理
const store = useAugmentCleanerStore()

// 计算属性
const riskLevelText = computed(() => {
  const levels = {
    low: '低风险',
    medium: '中等风险',
    high: '高风险',
  }
  return levels[store.riskAssessment?.riskLevel || 'low']
})

// 方法
const refreshStatus = async () => {
  await store.checkSystemStatus()
  await store.assessRisk()
}

const startCleaning = async () => {
  try {
    // 检查 VS Code 是否在运行
    const isVSCodeRunning = await store.checkVSCodeRunning()
    if (isVSCodeRunning) {
      const confirmed = await window.electronAPI.showMessageBox({
        type: 'warning',
        title: '警告',
        message: 'VS Code 正在运行',
        detail: '为了确保操作成功，建议先完全退出 VS Code。是否继续？',
        buttons: ['取消', '继续'],
        defaultId: 0,
        cancelId: 0,
      })

      if (confirmed.response === 0) {
        return
      }
    }

    // 确认操作
    const confirmed = await window.electronAPI.showMessageBox({
      type: 'question',
      title: '确认清理',
      message: '确定要开始清理 AugmentCode 数据吗？',
      detail: '此操作将修改遥测 ID、清理数据库记录和工作区文件。操作前会自动创建备份。',
      buttons: ['取消', '开始清理'],
      defaultId: 1,
      cancelId: 0,
    })

    if (confirmed.response === 1) {
      await store.performFullClean()

      // 显示完成消息
      await window.electronAPI.showMessageBox({
        type: 'info',
        title: '清理完成',
        message: '所有清理操作已成功完成！',
        detail: '现在可以重新启动 VS Code 并使用新邮箱登录 AugmentCode 插件。',
        buttons: ['确定'],
      })
    }
  } catch (error) {
    console.error('清理操作失败:', error)
  }
}

const previewAllChanges = async () => {
  try {
    const preview = await store.previewOperations()

    let message = '预览将要执行的操作:\n\n'

    if (preview.telemetryChanges) {
      message += '遥测 ID 修改:\n'
      message += `  当前机器 ID: ${preview.telemetryChanges.machineId.substring(0, 16)}...\n`
      message += `  当前设备 ID: ${preview.telemetryChanges.deviceId}\n`
      message += '  将生成新的随机 ID\n\n'
    }

    if (preview.databaseRecords.length > 0) {
      message += `数据库清理:\n`
      message += `  将删除 ${preview.databaseRecords.length} 条包含 'augment' 的记录\n\n`
    }

    if (preview.workspaceContents.length > 0) {
      message += `工作区清理:\n`
      message += `  将删除 ${preview.workspaceContents.length} 个文件/目录\n`
    }

    await window.electronAPI.showMessageBox({
      type: 'info',
      title: '操作预览',
      message: '预览清理操作',
      detail: message,
      buttons: ['确定'],
    })
  } catch (error) {
    console.error('预览操作失败:', error)
  }
}

const previewTelemetryChanges = async () => {
  if (!store.systemStatus?.currentTelemetryIds) return

  const current = store.systemStatus.currentTelemetryIds
  const message =
    `当前遥测 ID:\n\n` +
    `机器 ID: ${current?.machineId || '未知'}\n` +
    `设备 ID: ${current?.deviceId || '未知'}\n\n` +
    `操作将生成新的随机 ID 来替换当前值。`

  await window.electronAPI.showMessageBox({
    type: 'info',
    title: '遥测 ID 预览',
    message: '当前遥测 ID 信息',
    detail: message,
    buttons: ['确定'],
  })
}

const previewDatabaseChanges = async () => {
  try {
    const records = await window.electronAPI.previewAugmentRecords(
      store.systemStatus?.systemPaths.dbPath || ''
    )

    let message = `数据库中包含 'augment' 的记录:\n\n`

    if (records.length === 0) {
      message += '未找到相关记录。'
    } else {
      message += `共找到 ${records.length} 条记录，以下是前 10 条:\n\n`
      records.slice(0, 10).forEach((record: { key: string; value: string }, index: number) => {
        message += `${index + 1}. ${record.key}\n`
      })

      if (records.length > 10) {
        message += `\n... 还有 ${records.length - 10} 条记录`
      }
    }

    await window.electronAPI.showMessageBox({
      type: 'info',
      title: '数据库记录预览',
      message: '将要删除的记录',
      detail: message,
      buttons: ['确定'],
    })
  } catch (error) {
    console.error('预览数据库记录失败:', error)
  }
}

const previewWorkspaceChanges = async () => {
  try {
    const contents = await window.electronAPI.previewWorkspaceContents(
      store.systemStatus?.systemPaths.workspaceStoragePath || '',
      20
    )

    let message = `工作区存储目录内容:\n\n`

    if (contents.length === 0) {
      message += '目录为空。'
    } else {
      message += `共 ${contents.length} 个项目，以下是前 20 个:\n\n`
      contents.forEach(
        (
          item: { name: string; type: 'file' | 'directory'; size: number; path: string },
          index: number
        ) => {
          const type = item.type === 'directory' ? '[目录]' : '[文件]'
          const size = item.type === 'file' ? ` (${formatFileSize(item.size)})` : ''
          message += `${index + 1}. ${type} ${item.name}${size}\n`
        }
      )
    }

    await window.electronAPI.showMessageBox({
      type: 'info',
      title: '工作区内容预览',
      message: '将要清理的内容',
      detail: message,
      buttons: ['确定'],
    })
  } catch (error) {
    console.error('预览工作区内容失败:', error)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(async () => {
  await store.initialize()
})
</script>
