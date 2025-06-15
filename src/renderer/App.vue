<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Title Bar (for custom window controls if needed) -->
    <div
      v-if="showTitleBar"
      class="title-bar bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-8 flex items-center justify-between px-4"
    >
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full bg-red-500"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      <div class="title-bar-text text-sm font-medium text-gray-600 dark:text-gray-300">
        {{ appTitle }}
      </div>
      <div class="w-16"></div>
    </div>

    <!-- Navigation -->
    <nav
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-8">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="nav-title text-xl font-bold text-primary-600 dark:text-primary-400">
                Electron Vue3 Starter
              </h1>
            </div>
            <div class="flex space-x-4">
              <router-link
                v-for="route in navigationRoutes"
                :key="route.path"
                :to="route.path"
                class="nav-link"
                :class="isActiveRoute(route.path) ? 'nav-link-active' : ''"
              >
                {{ route.name }}
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="nav-info text-sm text-gray-500 dark:text-gray-400">v{{ appVersion }}</span>
            <span class="nav-info text-sm text-gray-500 dark:text-gray-400">{{ platform }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- About Modal -->
    <AboutModal v-if="showAboutModal" @close="showAboutModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AboutModal from '@/components/AboutModal.vue'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settingsStore = useSettingsStore()
const showTitleBar = ref(false)
const appTitle = ref('Electron Vue3 Starter')
const appVersion = ref('1.0.0')
const platform = ref('unknown')
const showAboutModal = ref(false)

const navigationRoutes = [
  { path: '/', name: 'AugmentCode 清理器' },
  { path: '/email', name: '随机邮箱生成器' },
  { path: '/settings', name: 'Settings' },
]

const isActiveRoute = (path: string): boolean => {
  return route.path === path
}

const handleShowAbout = () => {
  showAboutModal.value = true
}

onMounted(async () => {
  // Initialize settings - this will load and apply saved theme and font settings
  await settingsStore.initializeSettings()

  // Get app information
  if (window.electronAPI) {
    try {
      appVersion.value = await window.electronAPI.getVersion()
      platform.value = await window.electronAPI.getPlatform()
    } catch (error) {
      console.error('Failed to get app info:', error)
    }

    // Listen for about dialog
    window.electronAPI.onShowAbout(handleShowAbout)
  }

  // Show title bar on Windows/Linux if needed
  showTitleBar.value = platform.value !== 'darwin'
})

onUnmounted(() => {
  if (window.electronAPI) {
    window.electronAPI.removeAllListeners('show-about')
  }
})
</script>

<style scoped>
.title-bar {
  -webkit-app-region: drag;
  user-select: none;
}

.title-bar > * {
  -webkit-app-region: no-drag;
}
</style>
