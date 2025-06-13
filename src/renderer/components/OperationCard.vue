<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4" 
       :class="borderColorClass">
    <div class="flex items-start justify-between">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center"
               :class="iconBgClass">
            <div class="w-5 h-5" :class="iconColorClass" v-html="iconComponent"></div>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {{ description }}
          </p>
          
          <!-- 详细信息 -->
          <div v-if="details && details.length > 0" class="mt-3 space-y-2">
            <div v-for="(detail, index) in details" :key="index" 
                 class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span class="font-medium mr-2">{{ detail.label }}:</span>
              <span>{{ detail.value }}</span>
            </div>
          </div>
          
          <!-- 状态指示器 -->
          <div v-if="status" class="mt-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="statusClass">
              <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClass"></span>
              {{ status }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="$slots.actions" class="flex-shrink-0 ml-4">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div v-if="progress !== undefined" class="mt-4">
      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
        <span>进度</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
             :style="{ width: `${progress}%` }"></div>
      </div>
    </div>
    
    <!-- 额外内容 -->
    <div v-if="$slots.default" class="mt-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Detail {
  label: string
  value: string | number
}

interface Props {
  title: string
  description: string
  type?: 'info' | 'warning' | 'success' | 'error'
  icon?: string
  status?: string
  details?: Detail[]
  progress?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  icon: 'info'
})

const borderColorClass = computed(() => {
  const colors = {
    info: 'border-blue-500',
    warning: 'border-yellow-500',
    success: 'border-green-500',
    error: 'border-red-500'
  }
  return colors[props.type]
})

const iconBgClass = computed(() => {
  const colors = {
    info: 'bg-blue-100 dark:bg-blue-900',
    warning: 'bg-yellow-100 dark:bg-yellow-900',
    success: 'bg-green-100 dark:bg-green-900',
    error: 'bg-red-100 dark:bg-red-900'
  }
  return colors[props.type]
})

const iconColorClass = computed(() => {
  const colors = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400'
  }
  return colors[props.type]
})

const statusClass = computed(() => {
  const colors = {
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
  }
  return colors[props.type]
})

const statusDotClass = computed(() => {
  const colors = {
    info: 'bg-blue-400',
    warning: 'bg-yellow-400',
    success: 'bg-green-400',
    error: 'bg-red-400'
  }
  return colors[props.type]
})

const iconComponent = computed(() => {
  const icons = {
    info: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    warning: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"></path></svg>`,
    success: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    error: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    telemetry: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>`,
    database: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>`,
    workspace: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path></svg>`
  }
  return icons[props.icon as keyof typeof icons] || icons.info
})
</script>
