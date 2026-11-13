import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  flattenTokens,
  generateIndex,
  generatePrimitivesCss,
  generateThemesCss,
  generateTypes,
  toJsTokens,
  toRgba255,
} from './generate-tokens.mjs'
import { generateVariantsCss } from './generate-variants.mjs'

const src = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')
const read = (file: string) => readFileSync(path.join(src, file), 'utf-8')
const readJson = (file: string) => JSON.parse(read(file)) as Record<string, unknown>

const primitiveConfig = readJson('tokens/primitive.json')
const semanticConfig = readJson('tokens/semantic.json') as {
  light: Record<string, unknown>
  dark: Record<string, unknown>
}
const primitives = flattenTokens(primitiveConfig)

describe('toRgba255', () => {
  it.each([
    ['#fff', [255, 255, 255, 255]],
    ['#151517', [21, 21, 23, 255]],
    ['#00000080', [0, 0, 0, 128]],
    ['rgba(0, 0, 0, 0.08)', [0, 0, 0, 20]],
    ['rgba(255 255 255 / 0.4)', [255, 255, 255, 102]],
    ['rgb(1, 2, 3)', [1, 2, 3, 255]],
  ])('converts %s', (input, expected) => {
    expect(toRgba255(input)).toEqual(expected)
  })

  it('throws on values that are not colors', () => {
    expect(() => toRgba255('red')).toThrow('Unsupported color value')
  })
})

describe('semantic tokens', () => {
  it('define the same tokens for the light and dark themes', () => {
    expect(Object.keys(flattenTokens(semanticConfig.light)).sort()).toEqual(
      Object.keys(flattenTokens(semanticConfig.dark)).sort(),
    )
  })

  it('only reference primitives that exist', () => {
    expect(() => generateThemesCss(semanticConfig, primitives)).not.toThrow()
  })

  it('reject references to unknown primitives', () => {
    const broken = {
      light: { bg: { x: '--primitive-nope' } },
      dark: { bg: { x: '--primitive-nope' } },
    }
    expect(() => generateThemesCss(broken, primitives)).toThrow('--primitive-nope')
  })

  it('switch shadow colors with light-dark() while keeping offsets', () => {
    expect(generateThemesCss(semanticConfig, primitives)).toContain(
      '--shadow-elevation-raised: 0 1px 4px 0 light-dark(rgba(0 0 0 / 0.16), rgba(0 0 0 / 0.80));',
    )
  })
})

describe('generated files', () => {
  // Fails when someone edits the JSON without running `pnpm generate`, or hand-edits an output.
  it('are up to date with the token and variant JSON', () => {
    const { font: _font, icon: _icon, ...jsPrimitives } = primitiveConfig
    const jsTokens = {
      ...(toJsTokens(semanticConfig, primitives) as object),
      ...(toJsTokens(jsPrimitives, primitives) as object),
    }

    expect(read('tokens/tokens.css')).toBe(generatePrimitivesCss(primitives))
    expect(read('tokens/themes.css')).toBe(generateThemesCss(semanticConfig, primitives))
    expect(read('tokens/types.ts')).toBe(generateTypes(jsTokens))
    expect(read('tokens/index.ts')).toBe(generateIndex(jsTokens))
    expect(read('variants/variants.css')).toBe(
      generateVariantsCss(readJson('variants/variants.json') as Record<string, string>),
    )
  })
})

describe('generateVariantsCss', () => {
  it('wraps selectors in :where() so variants add no specificity', () => {
    expect(generateVariantsCss({ open: '[data-state="open"], [open]' })).toContain(
      '@custom-variant open (&:where([data-state="open"], [open]));',
    )
  })
})
