import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  css: {
    modules: {
      generateScopedName: 'gs-[local]_[hash:base64:5]',
    },
  },
})
