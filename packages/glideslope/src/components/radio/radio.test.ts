import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import GsRadio from './GsRadio.vue'
import GsRadioGroup from './GsRadioGroup.vue'

describe('GsRadio and GsRadioGroup', () => {
  it('add classes to the control, label and group label parts', () => {
    render(GsRadioGroup, {
      props: { label: 'Units', classes: { label: 'my-group-label' } },
      slots: {
        default: () =>
          h(
            GsRadio,
            { value: 'metric', classes: { control: 'my-control', label: 'my-label' } },
            () => 'Metric',
          ),
      },
    })
    expect(screen.getByText('Units (optional)')).toHaveClass('groupLabel', 'my-group-label')
    const radio = screen.getByRole('radio', { name: 'Metric' })
    expect(radio.querySelector('.control')).toHaveClass('my-control')
    expect(screen.getByText('Metric')).toHaveClass('label', 'my-label')
  })
})
