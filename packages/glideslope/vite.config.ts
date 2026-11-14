import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import globalGroups from './build/postcss-global-groups.js'
import { vueOptions } from './build/vue-options.js'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// Every runtime/peer dependency (and its subpaths) stays external to the library bundle.
const externals = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]
const isExternal = (id: string) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`))

/**
 * Browsers with native `light-dark()`, relative color syntax and cascade layers. Targeting these
 * keeps the compiled CSS free of polyfills so theme switching works through `color-scheme`.
 */
const cssTarget = ['chrome123', 'edge123', 'firefox128', 'safari18']

export default defineConfig({
  plugins: [vue(vueOptions), tailwindcss()],
  css: {
    postcss: { plugins: [globalGroups()] },
    modules: {
      // Readable, deterministic class names, e.g. `gs-button_3hJk2`.
      generateScopedName: 'gs-[local]_[hash:base64:5]',
    },
  },
  build: {
    target: 'es2022',
    cssTarget,
    cssCodeSplit: false,
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      cssFileName: 'glideslope',
    },
    rolldownOptions: {
      external: isExternal,
      output: {
        // One output module per source module so consumers tree-shake per component.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
})
