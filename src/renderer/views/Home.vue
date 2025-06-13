<template>
  <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <!-- Hero Section -->
    <div class="text-center mb-16">
      <div class="animate-bounce-subtle mb-8">
        <div
          class="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </div>
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4 animate-fade-in">
        Welcome to Electron Vue3 Starter
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up">
        A modern desktop application template built with Electron, Vue 3, Vite, TypeScript, and
        Tailwind CSS
      </p>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      <FeatureCard
        v-for="feature in features"
        :key="feature.title"
        :title="feature.title"
        :description="feature.description"
        :icon="feature.icon"
      />
    </div>

    <!-- Quick Actions -->
    <div class="card max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          @click="showSystemInfo"
          class="btn btn-primary flex items-center justify-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>System Info</span>
        </button>
        <button
          @click="openFileDialog"
          class="btn btn-secondary flex items-center justify-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
            ></path>
          </svg>
          <span>Open File</span>
        </button>
      </div>
    </div>

    <!-- System Information Display -->
    <div v-if="systemInfo" class="card max-w-2xl mx-auto mt-8 animate-slide-up">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-gray-600">Platform:</span>
          <span class="font-medium">{{ systemInfo.platform }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">App Version:</span>
          <span class="font-medium">{{ systemInfo.version }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Node.js:</span>
          <span class="font-medium">{{ systemInfo.nodeVersion || 'N/A' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Electron:</span>
          <span class="font-medium">{{ systemInfo.electronVersion || 'N/A' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Chrome:</span>
          <span class="font-medium">{{ systemInfo.chromeVersion || 'N/A' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FeatureCard from '@/components/FeatureCard.vue'

interface SystemInfo {
  platform: string
  version: string
  nodeVersion: string
  electronVersion: string
  chromeVersion: string
}

const systemInfo = ref<SystemInfo | null>(null)

const features = [
  {
    title: 'Modern Stack',
    description: 'Built with the latest versions of Electron, Vue 3, Vite, and TypeScript',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Fast Development',
    description: 'Hot Module Replacement (HMR) for instant feedback during development',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Type Safety',
    description: 'Full TypeScript support for both main and renderer processes',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Beautiful UI',
    description: 'Styled with Tailwind CSS for rapid and consistent design',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z',
  },
  {
    title: 'Cross Platform',
    description: 'Build and distribute for Windows, macOS, and Linux',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
  },
  {
    title: 'Secure',
    description: 'Context isolation and secure IPC communication between processes',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
]

const showSystemInfo = async () => {
  if (window.electronAPI) {
    try {
      const [platform, version, versions] = await Promise.all([
        window.electronAPI.getPlatform(),
        window.electronAPI.getVersion(),
        window.electronAPI.getVersions(),
      ])

      systemInfo.value = {
        platform,
        version,
        nodeVersion: versions.node,
        electronVersion: versions.electron,
        chromeVersion: versions.chrome,
      }
    } catch (error) {
      console.error('Failed to get system info:', error)
    }
  }
}

const openFileDialog = async () => {
  if (window.electronAPI) {
    try {
      const result = await window.electronAPI.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'Text Files', extensions: ['txt', 'md'] },
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] },
        ],
      })

      if (!result.canceled && result.filePaths.length > 0) {
        await window.electronAPI.showMessageBox({
          type: 'info',
          title: 'File Selected',
          message: `Selected file: ${result.filePaths[0]}`,
        })
      }
    } catch (error) {
      console.error('Failed to open file dialog:', error)
    }
  }
}
</script>
