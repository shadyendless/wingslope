import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsTooltip from './GsTooltip.vue'

describe('GsTooltip', () => {
  it('renders into its portal target', async () => {
    const target = document.createElement('div')
    document.body.append(target)
    render(GsTooltip, {
      props: { delay: 0, portalTo: target },
      slots: { trigger: () => h(GsButton, null, () => 'Settings'), default: () => 'Open settings' },
    })
    screen.getByRole('button', { name: 'Settings' }).focus()
    const tooltip = await screen.findByRole('tooltip')
    expect(target.contains(tooltip)).toBe(true)
    target.remove()
  })
})
