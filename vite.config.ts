import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path/win32'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], build: {
    target: 'es2020'  // Assure la compatibilité
  },  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
