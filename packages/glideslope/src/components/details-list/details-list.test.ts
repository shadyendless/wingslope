import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { provideDetailsListDefaults } from './defaults'
import GsDetailsList from './GsDetailsList.vue'
import GsDetailsListLabel from './GsDetailsListLabel.vue'
import GsDetailsListValue from './GsDetailsListValue.vue'

function row(label: string, value: string) {
  return [h(GsDetailsListLabel, null, () => label), h(GsDetailsListValue, null, () => value)]
}

describe('GsDetailsList defaults', () => {
  it('takes align and classes from provided defaults, explicit align wins', () => {
    const Parent = defineComponent({
      setup() {
        provideDetailsListDefaults({
          align: 'left',
          classes: { label: 'provided-label' },
          class: 'provided-list',
        })
        return () => [
          h(GsDetailsList, { 'data-testid': 'a' }, () => row('Callsign', 'RAVEN 21')),
          h(GsDetailsList, { align: 'center', classes: { label: 'own-label' } }, () =>
            row('Status', 'Airborne'),
          ),
        ]
      },
    })
    render(Parent)
    expect(screen.getByTestId('a')).toHaveClass('list', 'provided-list')
    expect(screen.getByText('Callsign')).toHaveClass('label', 'left', 'provided-label')
    expect(screen.getByText('RAVEN 21')).toHaveClass('value', 'left')

    // An explicit align wins; the list's own classes add to the provided ones.
    expect(screen.getByText('Status')).toHaveClass('label', 'center', 'provided-label', 'own-label')
    expect(screen.getByText('Airborne')).toHaveClass('value', 'center')
  })

  it('defaults to justify without a provider', () => {
    render(GsDetailsList, { slots: { default: () => row('Key', 'Value') } })
    expect(screen.getByText('Key')).toHaveClass('justify')
    expect(screen.getByText('Value')).toHaveClass('justify')
  })
})
