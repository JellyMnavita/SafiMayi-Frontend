import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path/win32'

export default defineConfig({
  plugins: [react()], build: {
    target: 'es2020' 
  }, resolve: { alias: { '@': path.resolve(__dirname, './src'), }, },
}) 