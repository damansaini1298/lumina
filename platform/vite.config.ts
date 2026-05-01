import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',   // relative paths — works on any GitHub Pages repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
