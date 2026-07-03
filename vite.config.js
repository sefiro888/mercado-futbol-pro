import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const githubPagesBase = repoName && !repoName.endsWith('.github.io') ? `/${repoName}/` : '/'

// Configuración de Vite + React.
// El alias "@" apunta a /src para imports limpios y fáciles de mantener.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? githubPagesBase : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false, // Don't auto-open browser in terminal environment
  },
})
