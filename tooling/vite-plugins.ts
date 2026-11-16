/**
 * Vite plugins shared by the packages' library builds, so that `vp build` alone (and `vp run build`,
 * `pnpm build`) builds a whole package: Vite writes the JavaScript and CSS, these plugins add the
 * steps a library build needs around it.
 */
import { execFileSync } from 'node:child_process'
import { cpSync, globSync, mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import type { ViteUserConfig } from 'vite-plus'

/** Vite's plugin type. `vite-plus` doesn't re-export it, so it is picked out of the config type. */
type Plugin = Extract<NonNullable<ViteUserConfig['plugins']>[number], { name: string }>

/**
 * Runs a dependency's command-line binary with the current Node. It is resolved from the package
 * being built rather than from `PATH`, which only includes `node_modules/.bin` inside scripts.
 */
function runBin(root: string, packageName: string, bin: string, args: string[]) {
  const manifestPath = createRequire(join(root, 'package.json')).resolve(
    `${packageName}/package.json`,
  )
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as {
    bin: string | Record<string, string>
  }
  const binPath = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin[bin]
  if (!binPath) throw new Error(`${packageName} has no "${bin}" binary`)
  execFileSync(process.execPath, [join(dirname(manifestPath), binPath), ...args], {
    cwd: root,
    stdio: 'inherit',
  })
}

/**
 * Runs the package's code generators (Node scripts, relative to `root`) before the build reads its
 * entry points. In watch mode they run once, at the start, so their output doesn't retrigger it.
 */
export function generateSources(root: string, scripts: string[]): Plugin {
  let generated = false
  return {
    name: 'glideslope:generate-sources',
    apply: 'build',
    buildStart() {
      if (generated) return
      generated = true
      for (const script of scripts) {
        execFileSync(process.execPath, [script], { cwd: root, stdio: 'inherit' })
      }
    },
  }
}

/**
 * Emits the declarations with `tsc`, or `vue-tsc` for packages with `.vue` files, once the bundle
 * is written. `project` must set `emitDeclarationOnly`, since Vite writes the JavaScript.
 */
export function emitDeclarations(
  root: string,
  compiler: 'tsc' | 'vue-tsc',
  project = 'tsconfig.build.json',
): Plugin {
  return {
    name: 'glideslope:emit-declarations',
    apply: 'build',
    writeBundle: {
      sequential: true,
      order: 'post',
      handler() {
        runBin(root, compiler === 'tsc' ? 'typescript' : 'vue-tsc', compiler, ['-p', project])
      },
    },
  }
}

/** Copies files matching `pattern` from `from` into `to` (both relative to `root`) as they are. */
export function copyFiles(root: string, pattern: string, from: string, to: string): Plugin {
  return {
    name: 'glideslope:copy-files',
    apply: 'build',
    writeBundle() {
      for (const file of globSync(pattern, { cwd: join(root, from) })) {
        const target = join(root, to, file)
        mkdirSync(dirname(target), { recursive: true })
        cpSync(join(root, from, file), target)
      }
    },
  }
}
