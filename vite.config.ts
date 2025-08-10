import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '#server': path.resolve(__dirname, 'server')
    }
  },
  esbuild: {
    jsx: 'automatic',
    include: [
      /src\/.*\.(tsx|ts|jsx|js)$/,
      /server\/.*\.(tsx|ts|jsx|js)$/
    ],
    loader: 'tsx'
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'jsx'
      }
    }
  },
  test: {
    environment: 'node',
    environmentMatchGlobs: [['src/**', 'jsdom']]
  }
})

