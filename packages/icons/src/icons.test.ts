import { mount } from '@vue/test-utils'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'
import * as icons from './index.js'
import ArrowKeys from './icons/arrow-keys.js'
import { AddIcon } from './index.js'

const svgDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'svg')

describe('icons', () => {
  it('exports one component per source SVG', () => {
    const svgCount = readdirSync(svgDir).filter((f) => f.endsWith('.svg')).length
    const iconExports = Object.keys(icons).filter((key) => key !== 'createIcon')
    expect(iconExports).toHaveLength(svgCount)
  })

  it('is decorative by default', () => {
    const svg = mount(AddIcon).find('svg')
    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('role')).toBeUndefined()
    expect(svg.find('title').exists()).toBe(false)
  })

  it('exposes an accessible name when given a title', () => {
    const svg = mount(AddIcon, { props: { title: 'Add item' } }).find('svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-hidden')).toBeUndefined()
    expect(svg.find('title').text()).toBe('Add item')
  })

  it('uses currentColor for placeholder fills', () => {
    const html = mount(AddIcon).html()
    expect(html).toContain('fill="currentColor"')
    expect(html).not.toMatch(/#898989/i)
  })

  it('keeps intentional two-tone colors', () => {
    expect(mount(ArrowKeys).html()).toMatch(/fill="#222"/)
  })

  it('passes attributes through to the svg element', () => {
    const svg = mount(AddIcon, { attrs: { class: 'size-l', 'data-testid': 'add' } }).find('svg')
    expect(svg.classes()).toContain('size-l')
    expect(svg.attributes('data-testid')).toBe('add')
  })
})
