import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Make absolutely sure anything in src with JSX/TSX gets transformed
  esbuild: {
    jsx: 'automatic',
    include: /src\/.*\.(tsx|ts|jsx|js)$/,
    loader: 'tsx' // default is smart, but we force TSX to avoid “preserve”-style issues
  },
  // And make the dependency pre-bundler parse .js that contains JSX
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
        '.jsx': 'jsx',
        '.js': 'jsx' // in case any local deps/components still use JSX in .js
      }
    }
  }
})
