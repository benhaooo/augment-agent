import { PathManager } from '../utils/pathManager'
import { DeviceCodes } from '../utils/deviceCodes'
import { FileBackup } from '../utils/fileBackup'

/**
 * JSON 修改器服务 - 修改 VS Code 的 storage.json 文件中的遥测 ID
 */
export interface TelemetryModificationResult {
  oldMachineId: string
  newMachineId: string
  oldDeviceId: string
  newDeviceId: string
  storageBackupPath: string
  machineIdBackupPath: string | null
}

export class JsonModifierService {
  /**
   * 修改遥测 ID
   * 1. 创建 storage.json 和 machine ID 文件的备份
   * 2. 读取 storage.json 文件
   * 3. 生成新的机器和设备 ID
   * 4. 更新 storage.json 中的 telemetry.machineId 和 telemetry.devDeviceId 值
   * 5. 更新机器 ID 文件中的新机器 ID
   * 6. 保存修改后的文件
   */
  static async modifyTelemetryIds(): Promise<TelemetryModificationResult> {
    const storagePath = await PathManager.getStoragePath()
    const machineIdPath = await PathManager.getMachineIdPath()

    // 检查 storage.json 文件是否存在
    if (!(await FileBackup.fileExists(storagePath))) {
      throw new Error(`Storage 文件未找到: ${storagePath}`)
    }

    // 创建备份
    const storageBackupPath = await FileBackup.createBackup(storagePath)
    let machineIdBackupPath: string | null = null
    
    if (await FileBackup.fileExists(machineIdPath)) {
      machineIdBackupPath = await FileBackup.createBackup(machineIdPath)
    }

    try {
      // 读取当前 JSON 内容
      const storageContent = await window.electronAPI.readFile(storagePath)
      const data = JSON.parse(storageContent)

      // 存储旧值
      const oldMachineId = data['telemetry.machineId'] || ''
      const oldDeviceId = data['telemetry.devDeviceId'] || ''

      // 生成新 ID
      const { machineId: newMachineId, deviceId: newDeviceId } = DeviceCodes.generateNewIds()

      // 更新 storage.json 中的值
      data['telemetry.machineId'] = newMachineId
      data['telemetry.devDeviceId'] = newDeviceId

      // 写入修改后的内容到 storage.json
      await window.electronAPI.writeFile(storagePath, JSON.stringify(data, null, 4))

      // 写入新的机器 ID 到机器 ID 文件
      await window.electronAPI.writeFile(machineIdPath, newDeviceId)

      return {
        oldMachineId,
        newMachineId,
        oldDeviceId,
        newDeviceId,
        storageBackupPath,
        machineIdBackupPath
      }
    } catch (error) {
      // 如果出错，尝试恢复备份
      try {
        await window.electronAPI.copyFile(storageBackupPath, storagePath)
        if (machineIdBackupPath) {
          await window.electronAPI.copyFile(machineIdBackupPath, machineIdPath)
        }
      } catch (restoreError) {
        console.error('恢复备份失败:', restoreError)
      }
      
      throw new Error(`修改遥测 ID 失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 验证 storage.json 文件格式
   */
  static async validateStorageFile(filePath?: string): Promise<boolean> {
    const path = filePath || await PathManager.getStoragePath()
    
    try {
      if (!(await FileBackup.fileExists(path))) {
        return false
      }

      const content = await window.electronAPI.readFile(path)
      const data = JSON.parse(content)
      
      // 检查是否包含必要的遥测字段
      return typeof data === 'object' && data !== null
    } catch {
      return false
    }
  }

  /**
   * 获取当前遥测 ID
   */
  static async getCurrentTelemetryIds(): Promise<{ machineId: string; deviceId: string } | null> {
    const storagePath = await PathManager.getStoragePath()
    
    try {
      if (!(await FileBackup.fileExists(storagePath))) {
        return null
      }

      const content = await window.electronAPI.readFile(storagePath)
      const data = JSON.parse(content)
      
      return {
        machineId: data['telemetry.machineId'] || '',
        deviceId: data['telemetry.devDeviceId'] || ''
      }
    } catch {
      return null
    }
  }
}
