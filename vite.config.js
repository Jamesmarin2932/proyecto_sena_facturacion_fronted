import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',  // Salida de la carpeta de producción
  },
  resolve: {
    alias: {
      '@': '/src', // Esto hace que '@' apunte a la carpeta src
    },
  },
})
