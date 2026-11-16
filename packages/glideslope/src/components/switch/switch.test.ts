import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import GsSwitch from './GsSwitch.vue'
import { provideSwitchDefaults } from './defaults'

describe('GsSwitch', () => {
  it('adds classes to the control and label parts', () => {
    render(GsSwitch, {
      props: { classes: { control: 'my-control', label: 'my-label' } },
      slots: { default: () => 'Show grid' },
    })
    const toggle = screen.getByRole('switch', { name: 'Show grid' })
    expect(toggle.querySelector('.control')).toHaveClass('my-control')
    expect(screen.getByText('Show grid')).toHaveClass('label', 'my-label')
  })

  it('takes provided defaults, which its own props override', async () => {
    render(
      defineComponent({
        setup() {
          provideSwitchDefaults({ labelPosition: 'start', disabled: true })
          return () => [
            h(GsSwitch, null, () => 'Provided'),
            h(GsSwitch, { labelPosition: 'end', disabled: false }, () => 'Own'),
          ]
        },
      }),
    )
    const provided = screen.getByRole('switch', { name: 'Provided' })
    expect(provided).toHaveClass('start')
    expect(provided).toBeDisabled()

    const own = screen.getByRole('switch', { name: 'Own' })
    expect(own).toHaveClass('end')
    await userEvent.click(own)
    expect(own).toHaveAttribute('aria-checked', 'true')
  })
})
