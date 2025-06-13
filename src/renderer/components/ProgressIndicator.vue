<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        清理进度
      </h3>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ progress?.progress || 0 }}%
      </span>
    </div>
    
    <!-- 进度条 -->
    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
           :style="{ width: `${progress?.progress || 0}%` }">
      </div>
    </div>
    
    <!-- 当前步骤 -->
    <div v-if="progress" class="space-y-3">
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full flex items-center justify-center"
               :class="currentStepIconBg">
            <div class="w-4 h-4" :class="currentStepIconColor" v-html="currentStepIcon"></div>
          </div>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ currentStepTitle }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ progress.message }}
          </p>
        </div>
      </div>
      
      <!-- 步骤列表 -->
      <div class="mt-6 space-y-2">
        <div v-for="step in steps" :key="step.key" 
             class="flex items-center space-x-3 p-2 rounded-md"
             :class="getStepClass(step.key)">
          <div class="flex-shrink-0">
            <div class="w-4 h-4" v-html="getStepIcon(step.key)"></div>
          </div>
          <span class="text-sm font-medium">{{ step.title }}</span>
          <div class="flex-1"></div>
          <div class="w-4 h-4" v-html="getStepStatusIcon(step.key)"></div>
        </div>
      </div>
    </div>
    
    <!-- 完成状态 -->
    <div v-if="isComplete" class="text-center py-4">
      <div class="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        清理完成！
      </h4>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        所有清理操作已成功完成，现在可以重新启动 VS Code 并使用新邮箱登录。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CleaningProgress } from '../services/augmentCleaner'

interface Props {
  progress?: CleaningProgress | null
  isComplete?: boolean
}

const props = defineProps<Props>()

const steps = [
  { key: 'telemetry', title: '修改遥测 ID' },
  { key: 'database', title: '清理数据库' },
  { key: 'workspace', title: '清理工作区' },
  { key: 'complete', title: '完成清理' }
]

const currentStepTitle = computed(() => {
  const stepTitles = {
    telemetry: '修改遥测 ID',
    database: '清理数据库',
    workspace: '清理工作区',
    complete: '完成清理'
  }
  return stepTitles[props.progress?.step || 'telemetry']
})

const currentStepIconBg = computed(() => {
  if (props.isComplete) return 'bg-green-100 dark:bg-green-900'
  return 'bg-blue-100 dark:bg-blue-900'
})

const currentStepIconColor = computed(() => {
  if (props.isComplete) return 'text-green-600 dark:text-green-400'
  return 'text-blue-600 dark:text-blue-400'
})

const currentStepIcon = computed(() => {
  if (props.isComplete) {
    return `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
  }

  const icons = {
    telemetry: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
    database: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>`,
    workspace: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>`,
    complete: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
  }

  return icons[props.progress?.step || 'telemetry']
})

const getStepClass = (stepKey: string) => {
  if (!props.progress) return 'text-gray-400 dark:text-gray-600'
  
  const currentIndex = steps.findIndex(s => s.key === props.progress?.step)
  const stepIndex = steps.findIndex(s => s.key === stepKey)
  
  if (stepIndex < currentIndex || props.isComplete) {
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
  } else if (stepIndex === currentIndex) {
    return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
  } else {
    return 'text-gray-400 dark:text-gray-600'
  }
}

const getStepIcon = (stepKey: string) => {
  const icons = {
    telemetry: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
    database: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>`,
    workspace: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>`,
    complete: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
  }

  return icons[stepKey as keyof typeof icons] || icons.telemetry
}

const getStepStatusIcon = (stepKey: string) => {
  if (!props.progress) return `<div class="w-4 h-4 rounded-full border-2 border-gray-300"></div>`

  const currentIndex = steps.findIndex(s => s.key === props.progress?.step)
  const stepIndex = steps.findIndex(s => s.key === stepKey)

  if (stepIndex < currentIndex || props.isComplete) {
    return `<svg class="text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
  } else if (stepIndex === currentIndex && !props.isComplete) {
    return `<div class="w-4 h-4 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>`
  } else {
    return `<div class="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>`
  }
}
</script>
