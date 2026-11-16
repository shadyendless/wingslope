import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsAccordion from './GsAccordion.vue'
import GsAccordionHeader from './GsAccordionHeader.vue'
import GsAccordionPanel from './GsAccordionPanel.vue'
import GsAccordionTrigger from './GsAccordionTrigger.vue'

describe('GsAccordionTrigger classes', () => {
  it('styles the heading and the trigger button', () => {
    render(GsAccordion, {
      slots: {
        default: () => [
          h(GsAccordionHeader, null, () =>
            h(
              GsAccordionTrigger,
              { level: 2, classes: { heading: 'custom-heading', trigger: 'custom-trigger' } },
              () => 'Sensors',
            ),
          ),
          h(GsAccordionPanel, null, () => 'Radar'),
        ],
      },
    })
    expect(screen.getByRole('heading', { level: 2, name: 'Sensors' })).toHaveClass(
      'heading',
      'custom-heading',
    )
    expect(screen.getByRole('button', { name: 'Sensors' })).toHaveClass('trigger', 'custom-trigger')
  })
})

describe('GsAccordionHeader buttons', () => {
  function renderHeader(disabled: boolean) {
    return render(GsAccordion, {
      props: { disabled },
      slots: {
        default: () => [
          h(GsAccordionHeader, null, () => [
            h(GsAccordionTrigger, null, () => 'Sensors'),
            h(GsButton, { 'aria-label': 'Sensor actions' }),
          ]),
          h(GsAccordionPanel, null, () => 'Radar'),
        ],
      },
    })
  }

  it('get a kebab icon, the menu style and the icon variant by default', () => {
    renderHeader(false)
    const menu = screen.getByRole('button', { name: 'Sensor actions' })
    expect(menu).toHaveClass('icon', 'menu')
    expect(menu.querySelector('svg')).not.toBeNull()
    // The trigger's own button isn't a header action.
    expect(screen.getByRole('button', { name: 'Sensors' })).not.toHaveClass('menu')
  })

  it('are disabled with the accordion', () => {
    renderHeader(true)
    expect(screen.getByRole('button', { name: 'Sensor actions' })).toBeDisabled()
  })
})
