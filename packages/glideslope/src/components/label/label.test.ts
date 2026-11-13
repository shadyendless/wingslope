import { render, screen } from '@testing-library/vue'
import { FieldRoot } from 'reka-ui'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, type VNode } from 'vue'
import { provideLabelDefaults } from './defaults'
import GsLabel from './GsLabel.vue'

/** Renders `content` below a component that provides required and disabled label defaults. */
function underLabelDefaults(content: () => VNode) {
  return defineComponent({
    setup() {
      provideLabelDefaults({ required: true, disabled: true })
      return content
    },
  })
}

describe('GsLabel defaults', () => {
  it('takes required and disabled from provided defaults', () => {
    render(underLabelDefaults(() => h(GsLabel, null, () => 'Name')))
    const label = screen.getByText('Name')
    expect(label).toHaveAttribute('data-required')
    expect(label).toHaveAttribute('data-disabled')
  })

  it('lets explicit props win over provided defaults', () => {
    render(underLabelDefaults(() => h(GsLabel, { required: false, disabled: false }, () => 'Name')))
    const label = screen.getByText('Name (optional)')
    expect(label).not.toHaveAttribute('data-required')
    expect(label).not.toHaveAttribute('data-disabled')
  })

  it('follows the surrounding field over provided defaults', () => {
    render(underLabelDefaults(() => h(FieldRoot, null, () => h(GsLabel, null, () => 'Email'))))
    const label = screen.getByText('Email (optional)')
    expect(label).not.toHaveAttribute('data-required')
    expect(label).not.toHaveAttribute('data-disabled')
  })
})
