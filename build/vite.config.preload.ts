import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  mode: 'production',
  build: {
    lib: {
      entry: resolve(__dirname, '../src/preload/preload.ts'),
      formats: ['cjs'],
      fileName: () => 'preload.cjs',
    },
    outDir: resolve(__dirname, '../dist/preload'),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs',
        'os',
        'crypto',
        'buffer',
        'stream',
        'util',
        'url',
        'string_decoder',
        'events',
      ],
    },
    minify: false,
  },
  resolve: {
    alias: {
      '@preload': resolve(__dirname, '../src/preload'),
    },
  },
})
