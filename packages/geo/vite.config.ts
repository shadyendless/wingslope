import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, lazyPlugins } from 'vite-plus'
import { emitDeclarations } from '../../tooling/vite-plugins'

const root = fileURLToPath(new URL('.', import.meta.url))
const srcDir = join(root, 'src')

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')) as {
  dependencies?: Record<string, string>
}

// Runtime dependencies (and their subpaths, e.g. `geodesy/utm`) stay external.
const externals = Object.keys(pkg.dependencies ?? {})
const isExternal = (id: string) => externals.some((dep) => id === dep || id.startsWith(`${dep}/`))

/** Every non-test source module, so each subpath in `exports` has its own output file. */
function sourceModules(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === '__fixtures__' ? [] : sourceModules(path)
    return entry.name.endsWith('.ts') && !/\.(test|bench|d)\.ts$/.test(entry.name) ? [path] : []
  })
}

export default defineConfig({
  plugins: lazyPlugins(() => [emitDeclarations(root, 'tsc')]),
  build: {
    target: 'es2022',
    sourcemap: true,
    // Readable output; consumers minify their own bundles.
    minify: false,
    lib: {
      entry: Object.fromEntries(
        sourceModules(srcDir).map((file) => [relative(srcDir, file).replace(/\.ts$/, ''), file]),
      ),
      formats: ['es'],
    },
    rolldownOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
})
