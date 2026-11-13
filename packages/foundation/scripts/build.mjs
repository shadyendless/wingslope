/**
 * Builds the foundation package into `dist/`:
 * - compiles the token TypeScript (JS + declarations)
 * - copies every stylesheet, keeping relative `@import` paths intact
 */
import { execFileSync } from 'node:child_process'
import { cpSync, globSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const src = path.join(root, 'src')
const dist = path.join(root, 'dist')

rmSync(dist, { recursive: true, force: true })

execFileSync('tsc', ['-p', 'tsconfig.build.json'], { cwd: root, stdio: 'inherit' })

for (const file of globSync('**/*.css', { cwd: src })) {
  mkdirSync(path.dirname(path.join(dist, file)), { recursive: true })
  cpSync(path.join(src, file), path.join(dist, file))
}

console.log('Built @wingbrace/glideslope-foundation')
