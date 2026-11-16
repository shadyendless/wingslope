import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { provideClassificationBannerDefaults } from './defaults'
import GsClassificationBanner from './GsClassificationBanner.vue'

describe('GsClassificationBanner', () => {
  it('renders custom text in a div', () => {
    render(GsClassificationBanner, { slots: { default: 'Unclassified' } })
    const banner = screen.getByText('Unclassified')
    expect(banner.tagName).toBe('DIV')
    expect(banner).toHaveClass('banner', 'missing')
  })

  it('shows the level name when it has no content', () => {
    render(GsClassificationBanner)
    expect(screen.getByText('Missing')).toBeInTheDocument()
  })

  it.each([
    ['unclassified', 'Unclassified'],
    ['cui', 'CUI'],
    ['confidential', 'Confidential'],
    ['secret', 'Secret'],
    ['top-secret', 'Top Secret'],
    ['ts-sci', 'Top Secret/SCI'],
  ] as const)('shows %s as "%s" with its class', (variant, text) => {
    render(GsClassificationBanner, { props: { variant } })
    expect(screen.getByText(text)).toHaveClass(variant)
  })

  it('merges classes and attributes onto the root', () => {
    render(GsClassificationBanner, { attrs: { class: 'sticky', role: 'banner' } })
    const banner = screen.getByRole('banner')
    expect(banner).toHaveClass('sticky', 'banner')
  })

  it('uses provided defaults, with props taking precedence', () => {
    const Host = defineComponent({
      setup() {
        provideClassificationBannerDefaults({ variant: 'secret' })
        return () => [h(GsClassificationBanner), h(GsClassificationBanner, { variant: 'cui' })]
      },
    })
    render(Host)
    expect(screen.getByText('Secret')).toHaveClass('secret')
    expect(screen.getByText('CUI')).toHaveClass('cui')
  })
})
