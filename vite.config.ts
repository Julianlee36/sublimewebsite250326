import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React framework code
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Firebase code
          'firebase-vendor': [
            'firebase/app', 
            'firebase/auth', 
            'firebase/firestore', 
            'firebase/storage'
          ],
        }
      }
    }
  }
})
