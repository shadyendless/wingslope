import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite-plus'
import { vueOptions } from './build/vue-options.js'

export default defineConfig({
  plugins: [vue(vueOptions)],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    css: {
      // Keep CSS Module class names predictable (`button`, `filled`, ...) in assertions.
      modules: { classNameStrategy: 'non-scoped' },
    },
  },
})
