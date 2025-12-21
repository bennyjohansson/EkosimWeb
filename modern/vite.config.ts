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
      // Proxy API calls to the Node.js API server (NOT the C++ backend)
      '/ekosim': {
        target: 'http://ekosim-api:3001',
        changeOrigin: true,
      },
      // Proxy authentication API calls to Node.js API server  
      '/api': {
        target: 'http://ekosim-api:3001',
        changeOrigin: true,
      },
      // Proxy any other backend routes to Node.js API server
      '/getWorldTable': {
        target: 'http://ekosim-api:3001',
        changeOrigin: true,
      },
      '/getHighScore': {
        target: 'http://ekosim-api:3001', 
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
