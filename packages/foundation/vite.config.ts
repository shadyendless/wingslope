import { fileURLToPath } from 'node:url'
import { defineConfig, lazyPlugins } from 'vite-plus'
import { copyFiles, emitDeclarations, generateSources } from '../../tooling/vite-plugins'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: lazyPlugins(() => [
    // Regenerates the token and variant files from their JSON sources first.
    generateSources(root, ['scripts/generate-tokens.mjs', 'scripts/generate-variants.mjs']),
    emitDeclarations(root, 'tsc'),
    // The stylesheets ship as written, so their relative `@import`s keep resolving in consumers'
    // Tailwind builds.
    copyFiles(root, '**/*.css', 'src', 'dist'),
  ]),
  build: {
    target: 'es2022',
    sourcemap: true,
    // Readable output; consumers minify their own bundles.
    minify: false,
    lib: { entry: { 'tokens/index': 'src/tokens/index.ts' }, formats: ['es'] },
    rolldownOptions: { output: { entryFileNames: '[name].js' } },
  },
})
