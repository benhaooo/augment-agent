/**
 * 设备代码生成工具类 - 浏览器兼容版本
 */
export class DeviceCodes {
  /**
   * 生成随机的 64 字符十六进制字符串作为机器 ID
   * 使用 Web Crypto API 生成安全的随机数
   */
  static generateMachineId(): string {
    // 生成 32 个随机字节（将变成 64 个十六进制字符）
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)

    // 转换为十六进制字符串
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 生成随机的 UUID v4 作为设备 ID
   * 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   * 其中 x 是任意十六进制数字，y 是 8、9、A 或 B 中的一个
   */
  static generateDeviceId(): string {
    // 生成 16 个随机字节
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)

    // 设置版本位 (第 7 个字节的高 4 位设为 0100，表示版本 4)
    array[6] = (array[6] & 0x0f) | 0x40

    // 设置变体位 (第 9 个字节的高 2 位设为 10)
    array[8] = (array[8] & 0x3f) | 0x80

    // 转换为 UUID 格式
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    const uuid = [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-')

    return uuid.toLowerCase()
  }

  /**
   * 生成新的机器 ID 和设备 ID 对
   */
  static generateNewIds(): { machineId: string; deviceId: string } {
    return {
      machineId: this.generateMachineId(),
      deviceId: this.generateDeviceId()
    }
  }

  /**
   * 验证机器 ID 格式（64 字符十六进制）
   */
  static isValidMachineId(machineId: string): boolean {
    return /^[a-f0-9]{64}$/i.test(machineId)
  }

  /**
   * 验证设备 ID 格式（UUID v4）
   */
  static isValidDeviceId(deviceId: string): boolean {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidV4Regex.test(deviceId)
  }
}
