import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración mínima de Vite + React.
// El alias "@" apunta a /src para imports limpios y fáciles de mantener.
export default defineConfig({
  base: '/mercado-futbol-pro/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})
