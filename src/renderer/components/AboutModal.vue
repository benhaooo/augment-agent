<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        class="modal-backdrop fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-60 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div
        class="modal-content relative bg-white dark:bg-gray-800 rounded-xl shadow-xl dark:shadow-2xl max-w-md w-full p-6 animate-slide-up border border-gray-200 dark:border-gray-700 transition-colors duration-200"
      >
        <!-- Close button -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <!-- Content -->
        <div class="text-center">
          <div
            class="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 rounded-2xl flex items-center justify-center mb-4"
          >
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>

          <h2 class="modal-title text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Electron Vue3 Starter
          </h2>
          <p class="modal-text text-gray-600 dark:text-gray-400 mb-4">Version {{ appVersion }}</p>

          <div class="text-left space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="modal-text text-gray-600 dark:text-gray-400">Platform:</span>
              <span class="font-medium text-gray-900 dark:text-gray-100">{{ platform }}</span>
            </div>
            <div class="flex justify-between">
              <span class="modal-text text-gray-600 dark:text-gray-400">Electron:</span>
              <span class="font-medium text-gray-900 dark:text-gray-100">{{
                electronVersion
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="modal-text text-gray-600 dark:text-gray-400">Node.js:</span>
              <span class="font-medium text-gray-900 dark:text-gray-100">{{ nodeVersion }}</span>
            </div>
            <div class="flex justify-between">
              <span class="modal-text text-gray-600 dark:text-gray-400">Chrome:</span>
              <span class="font-medium text-gray-900 dark:text-gray-100">{{ chromeVersion }}</span>
            </div>
          </div>

          <p class="modal-text text-sm text-gray-600 dark:text-gray-400 mb-6">
            A modern desktop application template built with Electron, Vue 3, Vite, TypeScript, and
            Tailwind CSS.
            <br />
            Created by
            <a
              href="https://github.com/benhaooo"
              class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >@benhaooo</a
            >
          </p>

          <div class="flex space-x-3">
            <button
              @click="openGitHub"
              class="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              <span>GitHub</span>
            </button>
            <button @click="$emit('close')" class="btn btn-primary flex-1">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Emits {
  (e: 'close'): void
}

defineEmits<Emits>()

const appVersion = ref('1.0.0')
const platform = ref('unknown')
const electronVersion = ref('N/A')
const nodeVersion = ref('N/A')
const chromeVersion = ref('N/A')

onMounted(async () => {
  if (window.electronAPI) {
    try {
      // 获取应用信息
      const [version, platformInfo, versions] = await Promise.all([
        window.electronAPI.getVersion(),
        window.electronAPI.getPlatform(),
        window.electronAPI.getVersions(),
      ])

      appVersion.value = version
      platform.value = platformInfo
      electronVersion.value = versions.electron
      nodeVersion.value = versions.node
      chromeVersion.value = versions.chrome
    } catch (error) {
      console.error('Failed to get app info:', error)
      // 设置默认值
      electronVersion.value = 'N/A'
      nodeVersion.value = 'N/A'
      chromeVersion.value = 'N/A'
    }
  }
})

const openGitHub = async () => {
  const githubUrl = 'https://github.com/benhaooo'

  if (window.electronAPI) {
    try {
      // 通过 Electron 打开外部链接
      await window.electronAPI.openExternal(githubUrl)
    } catch (error) {
      console.error('Failed to open GitHub link:', error)
      // 降级方案：在浏览器中打开
      window.open(githubUrl, '_blank')
    }
  } else {
    // 如果不在 Electron 环境中，直接在浏览器中打开
    window.open(githubUrl, '_blank')
  }
}
</script>
