import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { provideDividerDefaults } from './defaults'
import GsDivider from './GsDivider.vue'

describe('GsDivider defaults', () => {
  it('takes orientation and class from provided defaults, explicit orientation wins', () => {
    const Parent = defineComponent({
      setup() {
        provideDividerDefaults({ orientation: 'vertical', class: 'from-parent' })
        return () => [
          h(GsDivider, { 'data-testid': 'a' }),
          h(GsDivider, { 'data-testid': 'b', orientation: 'horizontal' }),
        ]
      },
    })
    render(Parent)
    const a = screen.getByTestId('a')
    expect(a).toHaveAttribute('data-orientation', 'vertical')
    expect(a).toHaveAttribute('aria-orientation', 'vertical')
    expect(a).toHaveClass('divider', 'from-parent')
    expect(screen.getByTestId('b')).toHaveAttribute('data-orientation', 'horizontal')
  })
})
