import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  mode: 'production',
  build: {
    lib: {
      entry: resolve(__dirname, '../src/main/main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.cjs',
    },
    outDir: resolve(__dirname, '../dist/main'),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs',
        'fs/promises',
        'os',
        'crypto',
        'buffer',
        'stream',
        'util',
        'url',
        'string_decoder',
        'events',
        'child_process',
        'better-sqlite3',
      ],
    },
    minify: false,
  },
  resolve: {
    alias: {
      '@main': resolve(__dirname, '../src/main'),
    },
  },
})
