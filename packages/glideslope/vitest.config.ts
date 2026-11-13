import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
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
