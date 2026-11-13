import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import GsActionBar from './GsActionBar.vue'

describe('GsActionBar elevation', () => {
  it.each(['flat', 'overlay', 'raised'] as const)('marks the %s elevation', (elevation) => {
    render(GsActionBar, { props: { elevation }, attrs: { 'aria-label': 'Map tools' } })
    expect(screen.getByRole('navigation', { name: 'Map tools' })).toHaveAttribute(
      'data-elevation',
      elevation,
    )
  })

  it('floats over content by default', () => {
    render(GsActionBar, { attrs: { 'aria-label': 'Map tools' } })
    expect(screen.getByRole('navigation')).toHaveAttribute('data-elevation', 'overlay')
  })
})
