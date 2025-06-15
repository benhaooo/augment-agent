import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { builtinModules } from 'node:module'

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
        ...builtinModules.flatMap(p => [p, `node:${p}`]),
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
