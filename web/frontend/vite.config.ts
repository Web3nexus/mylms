import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,        // No source maps in production
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendor chunks for better browser caching
        manualChunks: {
          react:  ['react', 'react-dom', 'react-router-dom'],
          ui:     ['lucide-react'],
          state:  ['zustand'],
          http:   ['axios'],
        }
      }
    }
  },
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': {
        target: 'https://mylms.test',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'https://mylms.test',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
