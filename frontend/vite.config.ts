import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Auto-detect environment: container vs local development
// Check multiple indicators for container environment
const isContainer = 
  process.env.DOCKER_ENV === 'true' || 
  process.env.VITE_DOCKER_ENV === 'true' ||
  process.env.HOSTNAME?.includes('docker') ||
  process.env.HOSTNAME?.includes('container')

const apiTarget = isContainer 
  ? 'http://ekosim-api:3001'    // Container networking (service name)
  : 'http://localhost:3001'     // Local development (API on port 3001)

console.log(`🔧 Vite proxy configuration:`)
console.log(`   Environment: ${isContainer ? 'Container' : 'Local'}`)
console.log(`   API Target: ${apiTarget}`)

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
