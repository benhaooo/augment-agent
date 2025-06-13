import { ref, onMounted } from 'vue'
import type { SystemInfo } from '@/types'
// 添加 Electron 类型导入
import type { MessageBoxOptions, OpenDialogOptions, SaveDialogOptions } from 'electron'

/**
 * Composable for interacting with Electron APIs
 */
export function useElectron() {
  const isElectron = ref(false)
  const systemInfo = ref<SystemInfo | null>(null)

  const checkElectronAvailability = () => {
    isElectron.value = !!window.electronAPI
  }

  const getSystemInfo = async (): Promise<SystemInfo | null> => {
    if (!window.electronAPI) return null

    try {
      const [platform, version] = await Promise.all([
        window.electronAPI.getPlatform(),
        window.electronAPI.getVersion(),
      ])

      // 使用 window.electronAPI 获取版本信息，而不是直接访问 process
      const versions = await window.electronAPI.getVersions()

      const info: SystemInfo = {
        platform,
        version,
        electronVersion: versions?.electron || 'N/A',
        nodeVersion: versions?.node || 'N/A',
        chromeVersion: versions?.chrome || 'N/A',
      }

      systemInfo.value = info
      return info
    } catch (error) {
      console.error('Failed to get system info:', error)
      return null
    }
  }

  const showMessageBox = async (options: MessageBoxOptions) => {
    if (!window.electronAPI) return null
    return await window.electronAPI.showMessageBox(options)
  }

  const showOpenDialog = async (options: OpenDialogOptions) => {
    if (!window.electronAPI) return null
    return await window.electronAPI.showOpenDialog(options)
  }

  const showSaveDialog = async (options: SaveDialogOptions) => {
    if (!window.electronAPI) return null
    return await window.electronAPI.showSaveDialog(options)
  }

  const minimizeWindow = async () => {
    if (!window.electronAPI) return
    await window.electronAPI.minimizeWindow()
  }

  const maximizeWindow = async () => {
    if (!window.electronAPI) return
    await window.electronAPI.maximizeWindow()
  }

  const closeWindow = async () => {
    if (!window.electronAPI) return
    await window.electronAPI.closeWindow()
  }

  const isWindowMaximized = async (): Promise<boolean> => {
    if (!window.electronAPI) return false
    return await window.electronAPI.isWindowMaximized()
  }

  onMounted(() => {
    checkElectronAvailability()
    if (isElectron.value) {
      getSystemInfo()
    }
  })

  return {
    isElectron,
    systemInfo,
    getSystemInfo,
    showMessageBox,
    showOpenDialog,
    showSaveDialog,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    isWindowMaximized,
  }
}
