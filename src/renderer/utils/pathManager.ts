/**
 * 路径管理工具类 - 通过 IPC 获取 VS Code 相关文件路径
 * 渲染进程版本，通过主进程获取路径信息
 */
export class PathManager {
  private static cachedPaths: {
    homeDir: string
    appDataDir: string
    vscodeConfigDir: string
    storagePath: string
    dbPath: string
    machineIdPath: string
    workspaceStoragePath: string
  } | null = null

  /**
   * 获取所有相关路径信息（通过 IPC）
   */
  static async getAllPaths() {
    if (this.cachedPaths) {
      return this.cachedPaths
    }

    try {
      this.cachedPaths = await window.electronAPI.getSystemPaths()
      return this.cachedPaths
    } catch (error) {
      console.error('获取系统路径失败:', error)
      // 返回默认路径作为后备
      const defaultPaths = {
        homeDir: '',
        appDataDir: '',
        vscodeConfigDir: '',
        storagePath: '',
        dbPath: '',
        machineIdPath: '',
        workspaceStoragePath: ''
      }
      this.cachedPaths = defaultPaths
      return defaultPaths
    }
  }

  /**
   * 获取用户主目录
   */
  static async getHomeDir(): Promise<string> {
    const paths = await this.getAllPaths()
    return paths?.homeDir || ''
  }

  /**
   * 获取应用数据目录
   */
  static async getAppDataDir(): Promise<string> {
    const paths = await this.getAllPaths()
    return paths?.appDataDir || ''
  }

  /**
   * 获取 VS Code 配置目录
   */
  static async getVSCodeConfigDir(): Promise<string> {
    const paths = await this.getAllPaths()
    return paths?.vscodeConfigDir || ''
  }

  /**
   * 获取 storage.json 文件路径
   */
  static async getStoragePath(): Promise<string> {
    const paths = await this.getAllPaths()
    return paths?.storagePath || ''
  }

  /**
   * 获取 state.vscdb 数据库文件路径
   */
  static async getDbPath(): Promise<string> {
    const paths = await this.getAllPaths()
    return paths?.dbPath || ''
  }

  /**
   * 获取机器 ID 文件路径
   */
  static async getMachineIdPath(): Promise<string> {
    const paths = await this.getAllPaths()
    return paths?.machineIdPath || ''
  }

  /**
   * 获取工作区存储目录路径
   */
  static async getWorkspaceStoragePath(): Promise<string> {
    const paths = await this.getAllPaths()
    return paths?.workspaceStoragePath || ''
  }

  /**
   * 清除缓存的路径信息
   */
  static clearCache(): void {
    this.cachedPaths = null
  }
}
