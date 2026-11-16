import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { provideClassificationBadgeDefaults } from './defaults'
import GsClassificationBadge from './GsClassificationBadge.vue'
import type { GsClassificationBadgeDefaults } from './types'

function withDefaults(defaults: GsClassificationBadgeDefaults, props = {}) {
  const Host = defineComponent({
    setup() {
      provideClassificationBadgeDefaults(defaults)
      return () => h(GsClassificationBadge, props)
    },
  })
  return render(Host)
}

describe('GsClassificationBadge', () => {
  it('renders custom text in a span', () => {
    render(GsClassificationBadge, { slots: { default: 'Unclassified' } })
    const badge = screen.getByText('Unclassified')
    expect(badge.tagName).toBe('SPAN')
    expect(badge).toHaveClass('badge', 'missing')
  })

  it('shows the level name when it has no content', () => {
    render(GsClassificationBadge)
    expect(screen.getByText('Missing')).toBeInTheDocument()
  })

  it.each([
    ['unclassified', 'Unclassified'],
    ['cui', 'CUI'],
    ['confidential', 'Confidential'],
    ['secret', 'Secret'],
    ['top-secret', 'Top Secret'],
    ['ts-sci', 'TS/SCI'],
  ] as const)('shows %s as "%s" with its class', (variant, text) => {
    render(GsClassificationBadge, { props: { variant } })
    expect(screen.getByText(text)).toHaveClass(variant)
  })

  it('reflects the size, medium by default', () => {
    const first = render(GsClassificationBadge)
    expect(screen.getByText('Missing')).toHaveAttribute('data-size', 'medium')
    first.unmount()
    render(GsClassificationBadge, { props: { size: 'small' } })
    expect(screen.getByText('Missing')).toHaveAttribute('data-size', 'small')
  })

  it('merges classes and attributes onto the root', () => {
    render(GsClassificationBadge, { attrs: { class: 'extra', title: 'Level' } })
    const badge = screen.getByText('Missing')
    expect(badge).toHaveClass('extra', 'badge')
    expect(badge).toHaveAttribute('title', 'Level')
  })

  it('uses provided defaults, with props taking precedence', () => {
    const first = withDefaults({ variant: 'secret', size: 'small' })
    expect(screen.getByText('Secret')).toHaveAttribute('data-size', 'small')
    first.unmount()
    withDefaults({ variant: 'secret', size: 'small' }, { variant: 'cui', size: 'medium' })
    expect(screen.getByText('CUI')).toHaveAttribute('data-size', 'medium')
  })
})
