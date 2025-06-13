<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
      </svg>
      系统路径信息
    </h3>

    <div class="space-y-3">
      <div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">主目录</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">{{ paths.homeDir }}</p>
        </div>
      </div>

      <div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">应用数据目录</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">{{ paths.appDataDir }}</p>
        </div>
      </div>

      <div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">VS Code 配置目录</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">{{ paths.vscodeConfigDir }}</p>
        </div>
      </div>

      <div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <p class="text-sm font-medium text-gray-900 dark:text-white">Storage 文件</p>
            <span v-if="fileStatus.storageExists !== undefined"
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    fileStatus.storageExists
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  ]">
              {{ fileStatus.storageExists ? '存在' : '不存在' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">{{ paths.storagePath }}</p>
        </div>
      </div>

      <div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <p class="text-sm font-medium text-gray-900 dark:text-white">数据库文件</p>
            <span v-if="fileStatus.databaseExists !== undefined"
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    fileStatus.databaseExists
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  ]">
              {{ fileStatus.databaseExists ? '存在' : '不存在' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">{{ paths.dbPath }}</p>
        </div>
      </div>

      <div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white">机器 ID 文件</p>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">{{ paths.machineIdPath }}</p>
        </div>
      </div>

      <div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div class="flex-shrink-0 mt-1">
          <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <p class="text-sm font-medium text-gray-900 dark:text-white">工作区存储目录</p>
            <span v-if="fileStatus.workspaceExists !== undefined"
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    fileStatus.workspaceExists
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  ]">
              {{ fileStatus.workspaceExists ? '存在' : '不存在' }}
            </span>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono break-all">{{ paths.workspaceStoragePath }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  paths: {
    homeDir: string
    appDataDir: string
    vscodeConfigDir: string
    storagePath: string
    dbPath: string
    machineIdPath: string
    workspaceStoragePath: string
  }
  fileStatus: {
    storageExists: boolean
    databaseExists: boolean
    workspaceExists: boolean
  }
}

defineProps<Props>()
</script>


