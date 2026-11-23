import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Gọi /api/... từ giao diện sẽ được chuyển sang server Express (cổng 3001)
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
