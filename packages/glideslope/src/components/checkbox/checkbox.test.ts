import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import GsCheckbox from './GsCheckbox.vue'
import GsCheckboxGroup from './GsCheckboxGroup.vue'

describe('GsCheckbox', () => {
  it('adds classes to the control and label parts', () => {
    render(GsCheckbox, {
      props: { classes: { control: 'my-control', label: 'my-label' } },
      attrs: { class: 'my-checkbox' },
      slots: { default: () => 'Acknowledge' },
    })
    const checkbox = screen.getByRole('checkbox', { name: 'Acknowledge' })
    expect(checkbox).toHaveClass('checkbox', 'my-checkbox')
    expect(checkbox.querySelector('.control')).toHaveClass('my-control')
    expect(screen.getByText('Acknowledge')).toHaveClass('label', 'my-label')
  })
})

describe('GsCheckboxGroup', () => {
  it('adds a class to the group label', () => {
    render(GsCheckboxGroup, {
      props: { label: 'Layers', classes: { label: 'my-label' } },
      slots: { default: () => h(GsCheckbox, { value: 'tracks' }, () => 'Tracks') },
    })
    expect(screen.getByText('Layers (optional)')).toHaveClass('groupLabel', 'my-label')
    expect(screen.getByRole('group', { name: /Layers/ })).toBeInTheDocument()
  })
})
