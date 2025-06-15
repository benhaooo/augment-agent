import type { AppSettings, ValidationResult } from '@/types'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { deepClone } from '@/utils'
import { handleSuccess, withErrorHandling } from '@/utils/errorHandler'

const defaultSettings: AppSettings = {
  theme: 'light',
  fontSize: 14,
}

const STORAGE_KEY = 'app-settings'

// Settings validation function with detailed error reporting
function validateSettings(settings: any): ValidationResult {
  const errors: string[] = []

  if (!settings || typeof settings !== 'object') {
    return { isValid: false, errors: ['Settings must be an object'] }
  }

  // Validate theme
  if (!['light', 'dark', 'auto'].includes(settings.theme)) {
    errors.push('Theme must be "light", "dark", or "auto"')
  }

  // Validate fontSize
  if (typeof settings.fontSize !== 'number' || settings.fontSize < 12 || settings.fontSize > 20) {
    errors.push('Font size must be a number between 12 and 20')
  }

  return { isValid: errors.length === 0, errors }
}

export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref<AppSettings>({ ...defaultSettings })
  const isLoading = ref(false)
  const hasUnsavedChanges = ref(false)

  // Apply theme settings to DOM
  const applyTheme = async (theme: string) => {
    const html = document.documentElement
    html.classList.remove('light', 'dark')

    if (theme === 'dark') {
      html.classList.add('dark')
    }
    else if (theme === 'light') {
      html.classList.add('light')
    }
    else {
      // Auto theme - detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const appliedTheme = prefersDark ? 'dark' : 'light'
      html.classList.add(appliedTheme)
    }

    // 同步主题到主进程
    if (window.electronAPI) {
      try {
        await window.electronAPI.updateTheme(theme)
      }
      catch (error) {
        console.warn('Failed to sync theme to main process:', error)
      }
    }
  }

  // Apply font size settings to DOM
  const applyFontSize = (fontSize: number) => {
    document.documentElement.style.fontSize = `${fontSize}px`
  }

  // Auto-save settings to localStorage
  const autoSaveSettings = async () => {
    await withErrorHandling(
      async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
        hasUnsavedChanges.value = false
      },
      'Failed to auto-save settings',
      {
        title: 'Settings Save Warning',
        type: 'warning',
      },
    )
  }

  // Load settings from localStorage
  const loadSettings = async () => {
    isLoading.value = true

    await withErrorHandling(
      async () => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const savedSettings = JSON.parse(saved)
          // Validate loaded settings
          const validation = validateSettings(savedSettings)
          if (validation.isValid) {
            settings.value = { ...defaultSettings, ...savedSettings }
          }
          else {
            console.warn('Invalid settings format:', validation.errors)
            settings.value = deepClone(defaultSettings)
          }
        }
        else {
          settings.value = deepClone(defaultSettings)
        }
      },
      'Failed to load settings',
      {
        showUserNotification: false, // 不显示通知，静默失败
        logToConsole: true,
      },
    )

    isLoading.value = false
  }

  // Manually save settings with user confirmation
  const saveSettings = async (): Promise<boolean> => {
    const result = await withErrorHandling(
      async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
        hasUnsavedChanges.value = false
        await handleSuccess('Your settings have been saved successfully!', 'Settings Saved')
        return true
      },
      'Failed to save settings',
      {
        title: 'Save Failed',
      },
    )

    return result !== null
  }

  // Reset settings to defaults
  const resetSettings = () => {
    settings.value = deepClone(defaultSettings)
    hasUnsavedChanges.value = true
  }

  // Export settings to JSON file
  const exportSettings = async (): Promise<boolean> => {
    if (!window.electronAPI)
      return false

    const result = await withErrorHandling(
      async () => {
        const dialogResult = await window.electronAPI.showSaveDialog({
          defaultPath: 'app-settings.json',
          filters: [{ name: 'JSON Files', extensions: ['json'] }],
        })

        if (!dialogResult.canceled && dialogResult.filePath) {
          const settingsJson = JSON.stringify(settings.value, null, 2)
          const writeResult = await window.electronAPI.writeFile(
            dialogResult.filePath,
            settingsJson,
          )

          if (writeResult.success) {
            await handleSuccess(
              `Settings successfully exported to: ${dialogResult.filePath}`,
              'Export Complete',
            )
            return true
          }
          else {
            throw new Error(writeResult.error || 'Failed to write file')
          }
        }
        return false
      },
      'Failed to export settings',
      {
        title: 'Export Error',
      },
    )

    return result !== null && result !== false
  }

  // Import settings from JSON file
  const importSettings = async (): Promise<boolean> => {
    if (!window.electronAPI)
      return false

    const result = await withErrorHandling(
      async () => {
        const dialogResult = await window.electronAPI.showOpenDialog({
          filters: [{ name: 'JSON Files', extensions: ['json'] }],
          properties: ['openFile'],
        })

        if (!dialogResult.canceled && dialogResult.filePaths.length > 0) {
          const filePath = dialogResult.filePaths[0]
          // Note: In a real implementation, you'd need to add a file read IPC handler
          // For now, we'll show a placeholder
          await handleSuccess(
            `Settings import from ${filePath} would be implemented here`,
            'Import Placeholder',
          )
          return true
        }
        return false
      },
      'Failed to import settings',
      {
        title: 'Import Error',
      },
    )

    return result !== null && result !== false
  }

  // Initialize settings (load and apply)
  const initializeSettings = async () => {
    await loadSettings()
    await applyTheme(settings.value.theme)
    applyFontSize(settings.value.fontSize)
  }

  // Debounced auto-save function
  let saveTimeout: NodeJS.Timeout | null = null
  const debouncedAutoSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(async () => {
      await autoSaveSettings()
      hasUnsavedChanges.value = false
    }, 500) // 500ms debounce delay
  }

  // Watch theme changes and apply immediately
  watch(
    () => settings.value.theme,
    async (newTheme: string) => {
      await applyTheme(newTheme)
      debouncedAutoSave()
    },
    { immediate: false },
  )

  // Watch font size changes and apply immediately
  watch(
    () => settings.value.fontSize,
    (newSize: number) => {
      applyFontSize(newSize)
      debouncedAutoSave()
    },
    { immediate: false }
  )



  return {
    // State
    settings,
    isLoading,
    hasUnsavedChanges,

    // Methods
    loadSettings,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    initializeSettings,
    applyTheme,
    applyFontSize,
  }
})
