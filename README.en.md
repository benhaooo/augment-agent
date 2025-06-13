# Electron Vue3 Starter

<div align="center">

[English](README.en.md) | [中文](README.md)

</div>

A modern, comprehensive Electron application template built with the latest web technologies for creating cross-platform desktop applications.

## 🚀 Features

### Core Technologies

- **Electron** - Cross-platform desktop app framework
- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework

### Development Experience

- ⚡ **Hot Module Replacement (HMR)** - Instant feedback during development
- 🔧 **TypeScript Support** - Full type safety for both main and renderer processes
- 🎨 **Modern UI Components** - Pre-built components with Tailwind CSS
- 📱 **Responsive Design** - Mobile-first responsive layouts
- 🔍 **ESLint & Prettier** - Code linting and formatting
- 🧪 **Example Components** - Comprehensive examples and patterns

### Electron Features

- 🔒 **Security First** - Context isolation and secure IPC communication
- 🖥️ **Native Integration** - System dialogs, menus, and window controls
- 📦 **Multi-platform Building** - Build for Windows, macOS, and Linux
- ⚙️ **Configurable** - Extensive configuration options
- 🎯 **Performance Optimized** - Efficient bundling and loading
- 🌓 **Dark/Light Themes** - Complete theme support with system theme detection

## 📁 Project Structure

```
electron-vue3-starter/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts          # Main process entry point
│   │   └── menu.ts          # Application menu configuration
│   ├── preload/             # Preload scripts
│   │   └── preload.ts       # IPC bridge between main and renderer processes
│   └── renderer/            # Vue 3 renderer process
│       ├── components/      # Reusable Vue components
│       ├── composables/     # Vue 3 composition functions
│       ├── views/           # Page components
│       ├── types/           # TypeScript type definitions
│       ├── router/          # Vue Router configuration
│       ├── App.vue          # Root Vue component
│       ├── main.ts          # Renderer process entry point
│       └── style.css        # Global styles
├── build/                   # Build configuration
├── public/                  # Static assets
├── dist/                    # Build output
└── Configuration files
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm

### Installation

1. **Clone or download this template**

   ```bash
   git clone <repository-URL>
   cd electron-vue3-starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

## 🚀 Development

### Start the development server

```bash
npm run dev
```

This command will:

- Start the Vite development server for the renderer process
- Launch Electron with hot-reload support
- Automatically open DevTools in development mode

### Available Scripts

#### Development

- `npm run dev` - Start the development server with hot-reload
- `npm run dev:vite` - Start only the Vite development server
- `npm run dev:electron` - Start only Electron (requires Vite server running)

#### Building

- `npm run build` - Build all processes (renderer, main, preload)
- `npm run build:renderer` - Build only the renderer process
- `npm run build:main` - Build only the main process
- `npm run build:preload` - Build only the preload script

#### Packaging

- `npm run build:all` - Build and package for the current platform
- `npm run build:win` - Build and package for Windows
- `npm run build:mac` - Build and package for macOS
- `npm run build:linux` - Build and package for Linux

#### Code Quality

- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Production Build

### Build the application

```bash
npm run build
```

### Package for distribution

```bash
# For current platform
npm run build:all

# For specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

The built application will be available in the `release/` directory.

## 🔧 Configuration

### Electron Builder

Configure packaging options in `electron-builder.json`:

- Application metadata
- Platform-specific settings
- File associations
- Auto-update configuration

### Vite Configuration

- `vite.config.ts` - Renderer process configuration
- `build/vite.config.main.ts` - Main process configuration
- `build/vite.config.preload.ts` - Preload script configuration

### TypeScript Configuration

- `tsconfig.json` - Renderer process TypeScript configuration
- `tsconfig.node.json` - Main process TypeScript configuration

## 🎨 Customization

### Styling

- Modify `tailwind.config.js` to customize design tokens
- Update `src/renderer/style.css` to set global styles
- Create component-specific styles in Vue SFC files

### Adding New Pages

1. Create a new Vue component in `src/renderer/views/`
2. Add a route in `src/renderer/router/index.ts`
3. Update navigation in `src/renderer/App.vue`

### IPC Communication

1. Add new IPC handlers in `src/main/main.ts`
2. Expose methods in `src/preload/preload.ts`
3. Update TypeScript definitions in `src/renderer/types/electron.d.ts`

## 📚 Included Examples

### Vue 3 Composition API

- Reactive state management
- Computed properties
- Lifecycle hooks
- Custom composition functions

### Electron Integration

- System information retrieval
- File dialogs (open/save)
- Window controls
- Native menus
- IPC communication

### UI Components

- Feature cards
- Toggle switches
- Modal dialogs
- Form handling
- Responsive layouts

## 🔒 Security

This template implements Electron security best practices:

- **Context Isolation** - Renderer process isolated from Node.js
- **Preload Scripts** - Secure IPC communication bridge
- **CSP Headers** - Web security content security policy
- **No Node Integration** - Renderer process has no direct Node.js access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and code checks
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Electron](https://electronjs.org/) - Desktop application framework
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Vite](https://vitejs.dev/) - Fast build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://typescriptlang.org/) - Typed JavaScript

## 📞 Support

If you encounter any issues or have questions:

1. Consult the documentation
2. Search existing issues
3. Create a detailed new issue

## 🔧 Troubleshooting

### Type Errors

If you encounter TypeScript type errors, ensure:

1. `@types/node` and `@types/electron` are installed
2. `tsconfig.json` includes the correct type definitions
3. Access Electron features through `window.electronAPI` in the renderer process, not directly using the `process` object

### Build Issues

If you encounter issues during the build process:

1. Ensure Node.js version >= 18.0.0
2. Clear cache: `npm run clean`
3. Reinstall dependencies: `npm ci`
4. Build incrementally: first `npm run build:renderer`, then `npm run build:main`, etc.

### Platform-specific Issues

- **Windows**: Ensure Visual Studio Build Tools are installed
- **macOS**: Make sure Xcode Command Line Tools are installed
- **Linux**: Ensure necessary build dependencies are installed

---

**Happy Coding! 🎉**
