import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3456',
        changeOrigin: true,
      },
      '/openclaw': {
        target: 'http://localhost:3457',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openclaw/, ''),
      },
      '/ws': {
        target: 'ws://localhost:3456',
        ws: true,
      },
      '/ws-openclaw': {
        target: 'ws://localhost:3457',
        ws: true,
        rewrite: (path) => path.replace(/^\/ws-openclaw/, '/ws'),
      },
    },
  },
})
