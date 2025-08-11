import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#server': fileURLToPath(new URL('./server', import.meta.url)),
    },
  },
  test: {
    include: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**'],
    environment: 'node',
    environmentMatchGlobs: [['src/**', 'jsdom']],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
})

