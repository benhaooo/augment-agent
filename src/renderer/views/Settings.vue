<template>
  <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Configure your application preferences and settings
      </p>
    </div>

    <!-- Appearance Settings -->
    <div class="card mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Appearance</h2>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >Theme</label
          >
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              v-for="theme in themes"
              :key="theme.value"
              @click="settings.theme = theme.value"
              class="p-4 border-2 rounded-lg transition-all duration-200 text-gray-900 dark:text-gray-100"
              :class="
                settings.theme === theme.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:border-primary-400'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
              "
            >
              <div class="flex items-center space-x-3">
                <div :class="theme.color" class="w-4 h-4 rounded-full"></div>
                <span class="font-medium">{{ theme.label }}</span>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >Font Size</label
          >
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">Small</span>
            <input
              v-model="settings.fontSize"
              type="range"
              min="12"
              max="20"
              step="1"
              class="flex-1 accent-primary-600 dark:accent-primary-400"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">Large</span>
            <span class="text-sm font-medium w-12 text-gray-900 dark:text-gray-100"
              >{{ settings.fontSize }}px</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="card mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Notifications</h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">Desktop Notifications</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Show notifications on your desktop
            </p>
          </div>
          <ToggleSwitch v-model="settings.notifications.desktop" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">Sound Notifications</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Play sound when notifications appear
            </p>
          </div>
          <ToggleSwitch v-model="settings.notifications.sound" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">Auto-hide Notifications</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Automatically hide notifications after 5 seconds
            </p>
          </div>
          <ToggleSwitch v-model="settings.notifications.autoHide" />
        </div>
      </div>
    </div>

    <!-- Performance Settings -->
    <div class="card mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Performance</h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">Hardware Acceleration</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Use GPU acceleration when available
            </p>
          </div>
          <ToggleSwitch v-model="settings.performance.hardwareAcceleration" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">Background Processing</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Continue processing when window is minimized
            </p>
          </div>
          <ToggleSwitch v-model="settings.performance.backgroundProcessing" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >Memory Usage Limit</label
          >
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500 dark:text-gray-400">Low</span>
            <input
              v-model="settings.performance.memoryLimit"
              type="range"
              min="512"
              max="4096"
              step="256"
              class="flex-1 accent-primary-600 dark:accent-primary-400"
            />
            <span class="text-sm text-gray-500 dark:text-gray-400">High</span>
            <span class="text-sm font-medium w-16 text-gray-900 dark:text-gray-100"
              >{{ settings.performance.memoryLimit }}MB</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Privacy Settings -->
    <div class="card mb-8">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Privacy</h2>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">Analytics</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Help improve the app by sharing usage data
            </p>
          </div>
          <ToggleSwitch v-model="settings.privacy.analytics" />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium text-gray-900 dark:text-gray-100">Crash Reports</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Automatically send crash reports</p>
          </div>
          <ToggleSwitch v-model="settings.privacy.crashReports" />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button @click="resetSettings" class="btn btn-secondary">Reset to Defaults</button>
      <div class="space-x-3">
        <button @click="exportSettings" class="btn btn-secondary">Export Settings</button>
        <button @click="saveSettings" class="btn btn-primary">Save Changes</button>
      </div>
    </div>

    <!-- Settings Preview -->
    <div v-if="showPreview" class="card mt-8">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings Preview</h3>
      <pre
        class="text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-auto"
        >{{ JSON.stringify(settings, null, 2) }}</pre
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToggleSwitch from '@/components/ToggleSwitch.vue'
import { useSettingsStore } from '@/stores/settings'

// 使用 Pinia Store
const settingsStore = useSettingsStore()
const { settings } = settingsStore

const showPreview = ref(false)

const themes = [
  { value: 'light' as const, label: 'Light', color: 'bg-white border border-gray-300' },
  { value: 'dark' as const, label: 'Dark', color: 'bg-gray-800' },
  { value: 'auto' as const, label: 'Auto', color: 'bg-gradient-to-r from-white to-gray-800' },
]

// 使用 Store 中的方法
const resetSettings = () => {
  settingsStore.resetSettings()
}

const saveSettings = async () => {
  await settingsStore.saveSettings()
}

const exportSettings = async () => {
  await settingsStore.exportSettings()
}
</script>
