import { Time, parseDate, type CalendarDate } from '@internationalized/date'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { h, ref, shallowRef } from 'vue'
import GsColorPicker from '../color-picker/GsColorPicker.vue'
import { toHex } from '../color-picker/colors'
import GsDateField from './GsDateField.vue'
import GsTimeField from './GsTimeField.vue'
import { isPlaceholderSegment, isVisibleLiteral } from './segments'

function renderWithModel<T>(component: object, initial: T, props: Record<string, unknown>) {
  const model = shallowRef(initial)
  render(() =>
    h(component, {
      ...props,
      modelValue: model.value,
      'onUpdate:modelValue': (v: T) => (model.value = v),
    }),
  )
  return model
}

describe('date segments', () => {
  it('recognizes placeholder tokens but not values', () => {
    expect(isPlaceholderSegment({ part: 'month', value: 'mm' })).toBe(true)
    expect(isPlaceholderSegment({ part: 'hour', value: '––' })).toBe(true)
    expect(isPlaceholderSegment({ part: 'day', value: '13' })).toBe(false)
    expect(isPlaceholderSegment({ part: 'dayPeriod', value: 'PM' })).toBe(false)
  })

  it('keeps only time separators', () => {
    expect(isVisibleLiteral({ part: 'literal', value: ':' })).toBe(true)
    expect(isVisibleLiteral({ part: 'literal', value: '/' })).toBe(false)
  })
})

describe('GsDateField', () => {
  it('renders a labeled group with a short month name', async () => {
    renderWithModel(GsDateField, parseDate('2026-11-13'), { label: 'Departure' })
    expect(await screen.findByRole('group', { name: /Departure/ })).toBeInTheDocument()
    expect(screen.getByText('Nov')).toBeInTheDocument()
    expect(screen.getByText('13')).toBeInTheDocument()
  })

  it('steps a segment with the arrow keys', async () => {
    const model = renderWithModel<CalendarDate | null>(GsDateField, parseDate('2026-11-13'), {
      label: 'Departure',
    })
    screen.getByText('13').focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(model.value?.toString()).toBe('2026-11-14')
  })

  it('marks the group invalid with an error message', async () => {
    renderWithModel(GsDateField, null, { label: 'Departure', errorMessage: 'Required' })
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(await screen.findByRole('group', { name: /Departure/ })).toHaveAttribute('data-invalid')
  })
})

describe('GsTimeField', () => {
  it('shows and edits a time', async () => {
    const model = renderWithModel<Time | null>(GsTimeField, new Time(14, 30), {
      label: 'ETA',
      hourCycle: 24,
    })
    expect(await screen.findByRole('group', { name: /ETA/ })).toBeInTheDocument()
    screen.getByText('14').focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(model.value?.toString()).toBe('15:30:00')
  })
})

describe('toHex', () => {
  it('normalizes strings and RGBA tuples', () => {
    expect(toHex('#1484F4')).toBe('#1484f4')
    expect(toHex([255, 0, 51])).toBe('#ff0033')
    expect(toHex([255, 0, 51, 128])).toBe('#ff003380')
  })
})

describe('GsColorPicker', () => {
  function setup(props: Record<string, unknown> = {}) {
    const model = ref<string | undefined>('#1484f4')
    render(() =>
      h(GsColorPicker, {
        label: 'Track color',
        items: ['#1484f4', [14, 143, 55, 255]],
        ...props,
        modelValue: model.value,
        'onUpdate:modelValue': (v: string | undefined) => (model.value = v),
      }),
    )
    return model
  }

  it('selects a swatch as a hex string', async () => {
    const model = setup()
    expect(screen.getByRole('group', { name: /Track color/ })).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    await userEvent.click(options[1]!)
    expect(model.value).toBe('#0e8f37')
  })

  it('clears to undefined with the no-color option', async () => {
    const model = setup({ allowEmpty: true })
    await userEvent.click(screen.getByRole('button', { name: 'No color' }))
    expect(model.value).toBeUndefined()
    expect(screen.getByRole('button', { name: 'No color' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('offers a custom color button', () => {
    setup({ showCustomPicker: true })
    expect(screen.getByRole('button', { name: 'Custom color' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
