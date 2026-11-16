import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

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

/** The Apache-2.0 header the upstream `@accelint/geo` build puts on each output file. */
const banner = `/*
 * Copyright 2026 Hypergiant Galactic Systems Inc. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */`

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    // Readable output, as upstream ships it; consumers minify their own bundles.
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
        banner,
      },
    },
  },
})
