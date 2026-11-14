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

describe('GsTooltip classes', () => {
  it('styles the tooltip content', async () => {
    render(GsTooltip, {
      props: { delay: 0, classes: { content: 'custom-tip' } },
      slots: { trigger: () => h(GsButton, null, () => 'Help'), default: () => 'More info' },
    })
    screen.getByRole('button', { name: 'Help' }).focus()
    const tip = await screen.findByRole('tooltip')
    expect(tip.closest('.custom-tip')).not.toBeNull()
  })
})
