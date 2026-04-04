import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 설정 정보: https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true,
  },
  server: {
    host: true,
    port: 5173,
  },
})
