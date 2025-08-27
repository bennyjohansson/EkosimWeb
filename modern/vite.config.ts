import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

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
      // Proxy API calls to the legacy backend
      '/ekosim': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Proxy authentication API calls
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Proxy any other backend routes
      '/getWorldTable': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/getHighScore': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
