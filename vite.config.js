import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',  // Salida de la carpeta de producción
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Esto hace que '@' apunte a la carpeta src
      '@views': path.resolve(__dirname, 'src/views'), // Alias adicional para 'views'
    },
  },
})
