import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, lazyPlugins } from 'vite-plus'
import { emitDeclarations, generateSources } from '../../tooling/vite-plugins'

const root = fileURLToPath(new URL('.', import.meta.url))

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  peerDependencies?: Record<string, string>
}
const externals = Object.keys(pkg.peerDependencies ?? {})
const isExternal = (id: string) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`))

export default defineConfig({
  // Regenerates the icon components from `src/svg/` first, then writes their declarations.
  plugins: lazyPlugins(() => [
    generateSources(root, ['scripts/generate.mjs']),
    emitDeclarations(root, 'tsc'),
  ]),
  build: {
    target: 'es2022',
    sourcemap: true,
    // Readable output; consumers minify their own bundles.
    minify: false,
    lib: { entry: 'src/index.ts', formats: ['es'] },
    rolldownOptions: {
      external: isExternal,
      output: {
        // One output module per icon, so the `./*` subpath exports and tree-shaking keep working.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
})
