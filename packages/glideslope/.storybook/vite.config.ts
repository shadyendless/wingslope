import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import globalGroups from '../build/postcss-global-groups.js'
import { vueOptions } from '../build/vue-options.js'

export default defineConfig({
  plugins: [vue(vueOptions), tailwindcss()],
  css: {
    postcss: { plugins: [globalGroups()] },
    modules: {
      generateScopedName: 'gs-[local]_[hash:base64:5]',
    },
  },
})
