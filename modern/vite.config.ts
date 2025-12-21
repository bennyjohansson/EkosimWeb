import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Auto-detect environment: container vs local development
const isContainer = process.env.DOCKER_ENV === 'true'
const apiTarget = isContainer 
  ? 'http://ekosim-api:3001'    // Container networking
  : 'http://localhost:8080'     // Local development

console.log(`🔧 Vite proxy target: ${apiTarget} (container: ${isContainer})`)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API calls with auto-detection
      '/ekosim': {
        target: apiTarget,
        changeOrigin: true,
      },
      // Proxy authentication API calls
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
      // Proxy any other backend routes
      '/getWorldTable': {
        target: apiTarget,
        changeOrigin: true,
      },
      '/getHighScore': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
