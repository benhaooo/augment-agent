# Electron Vue3 Starter

一个现代化、全面的 Electron 应用模板，使用最新的 Web 技术构建跨平台桌面应用。

## 🚀 功能特性

### 核心技术

- **Electron** - 跨平台桌面应用框架
- **Vue 3** - 渐进式 JavaScript 框架，支持组合式 API
- **Vite** - 快速的构建工具和开发服务器
- **TypeScript** - 类型安全的 JavaScript 开发
- **Tailwind CSS** - 实用优先的 CSS 框架

### 开发体验

- ⚡ **热模块替换 (HMR)** - 开发过程中即时反馈
- 🔧 **TypeScript 支持** - 主进程和渲染进程的完整类型安全
- 🎨 **现代 UI 组件** - 使用 Tailwind CSS 的预构建组件
- 📱 **响应式设计** - 移动优先的响应式布局
- 🔍 **ESLint & Prettier** - 代码检查和格式化
- 🧪 **示例组件** - 全面的示例和模式

### Electron 特性

- 🔒 **安全优先** - 上下文隔离和安全的 IPC 通信
- 🖥️ **原生集成** - 系统对话框、菜单和窗口控制
- 📦 **多平台构建** - 为 Windows、macOS 和 Linux 构建
- ⚙️ **可配置** - 广泛的配置选项
- 🎯 **性能优化** - 高效的打包和加载
- 🌓 **深色/浅色主题** - 完整的主题支持和系统主题自动检测

## 📁 项目结构

```
electron-vue3-starter/
├── out/                      # 构建输出目录
├── release/                  # 打包输出目录
├── src/
│   ├── main/                 # Electron 主进程
│   │   └── index.ts          # 主进程入口点
│   ├── preload/              # 预加载脚本
│   │   └── index.ts          # 主进程和渲染进程之间的 IPC 桥接
│   └── renderer/             # Vue 3 渲染进程
│       ├── components/       # 可复用的 Vue 组件
│       ├── router/           # Vue Router 配置
│       └── index.ts          # 渲染进程入口点
├── index.html                # 渲染进程的 HTML 入口
├── electron.vite.config.ts   # Electron Vite 配置文件
└── ...                       # 其他配置文件
```

## 🛠️ 安装与设置

### 前提条件

- Node.js 18.0.0 或更高版本
- npm、yarn 或 pnpm

### 安装

1. **克隆或下载此模板**

   ```bash
   git clone <仓库-URL>
   cd electron-vue3-starter
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

## 🚀 开发

### 启动开发服务器

```bash
npm run dev
```

此命令将：

- 启动渲染进程的 Vite 开发服务器
- 启动支持热重载的 Electron
- 在开发模式下自动打开 DevTools

### 可用脚本

- `npm run dev` - 启动带热重载的开发服务器
- `npm run build` - 为当前平台构建和打包应用
- `npm run build:win` - 为 Windows 构建和打包
- `npm run build:mac` - 为 macOS 构建和打包
- `npm run build:linux` - 为 Linux 构建和打包
- `npm run lint` - 运行 ESLint 检查代码
- `npm run lint:fix` - 运行 ESLint 并自动修复问题
- `npm run type-check` - 运行 TypeScript 类型检查

## 🏗️ 生产构建

### 构建应用

```bash
# 这会根据你的开发环境为相应平台构建应用
npm run build
```

### 打包分发

```bash
# 为特定平台构建
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

构建的应用将在 `release/` 目录中可用。

## 🔧 配置

### Electron Builder

在 `electron-builder.json` 中配置打包选项。

### Vite 配置

在 `electron.vite.config.ts` 中配置主进程、预加载脚本和渲染进程的 Vite 选项。

### TypeScript 配置

在根目录的 `tsconfig.json` 中配置整个项目的 TypeScript 选项，它包含了主进程、预加载和渲染进程的配置。

## 🎨 自定义

### 样式

- 修改 `tailwind.config.js` 以自定义设计令牌
- 更新 `src/renderer/style.css` 以设置全局样式
- 在 Vue SFC 文件中创建组件特定样式

### 添加新页面

1. 在 `src/renderer/views/` 中创建新的 Vue 组件
2. 在 `src/renderer/router/index.ts` 中添加路由
3. 在 `src/renderer/App.vue` 中更新导航

### IPC 通信

1. 在 `src/main/ipcHandlers.ts` 中添加新的 IPC 处理程序 (或你选择的其他文件)
2. 在 `src/preload/index.ts` 中暴露方法
3. 在 `src/renderer/types/electron.d.ts` 中更新 TypeScript 定义

## 📚 包含的示例

### Vue 3 组合式 API

- 响应式状态管理
- 计算属性
- 生命周期钩子
- 自定义组合式函数

### Electron 集成

- 系统信息检索
- 文件对话框（打开/保存）
- 窗口控制
- 原生菜单
- IPC 通信

### UI 组件

- 功能卡片
- 切换开关
- 模态对话框
- 表单处理
- 响应式布局

## 🔒 安全

此模板实现了 Electron 安全最佳实践：

- **上下文隔离** - 渲染进程与 Node.js 隔离
- **预加载脚本** - 安全的 IPC 通信桥接
- **CSP 头** - Web 安全的内容安全策略
- **无 Node 集成** - 渲染进程没有直接的 Node.js 访问权限

## 🤝 贡献

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 运行测试和代码检查
5. 提交拉取请求

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。

## 🙏 致谢

- [Electron](https://electronjs.org/) - 桌面应用框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 快速构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [TypeScript](https://typescriptlang.org/) - 类型化 JavaScript

## 📞 支持

如果您遇到任何问题或有疑问：

1. 查阅文档
2. 搜索现有问题
3. 创建一个详细的新问题

## 🔧 常见问题解决

### 类型错误

如果遇到 TypeScript 类型错误，请确保：

1. 已安装 `@types/node` 和 `@types/electron`
2. `tsconfig.json` 中包含正确的类型定义
3. 在渲染进程中通过 `window.electronAPI` 访问 Electron 功能，而不是直接使用 `process` 对象

### 构建问题

如果构建过程中遇到问题：

1. 确保 Node.js 版本 >= 18.0.0
2. 删除 `out` 和 `release` 目录，以及 `node_modules` 和 `package-lock.json`
3. 重新安装依赖：`npm install`

### 平台特定问题

- **Windows**：确保安装了 Visual Studio 构建工具
- **macOS**：确保安装了 Xcode 命令行工具
- **Linux**：确保安装了必要的构建依赖

---

**编码愉快！🎉**
