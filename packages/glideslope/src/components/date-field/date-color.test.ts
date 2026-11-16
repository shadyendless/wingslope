import { Time, parseDate, type CalendarDate } from '@internationalized/date'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { convertToHsl, parseColor } from 'reka-ui'
import { describe, expect, it, vi } from 'vite-plus/test'
import { h, shallowRef } from 'vue'
import GsColorPicker from '../color-picker/GsColorPicker.vue'
import GsCustomColorPicker from '../color-picker/GsCustomColorPicker.vue'
import GsNoColorButton from '../color-picker/GsNoColorButton.vue'
import { formatColor, toHex, type GsColorInput } from '../color-picker/colors'
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

const fieldClasses = {
  label: 'my-label',
  control: 'my-control',
  input: 'my-input',
  segment: 'my-segment',
  description: 'my-description',
  error: 'my-error',
}

/** Checks that each part of a date or time field got its extra class. */
async function expectFieldClasses(name: RegExp) {
  const group = await screen.findByRole('group', { name })
  expect(group).toHaveClass('control', 'my-control')
  expect(group.querySelector('.my-input')).toHaveClass('input')
  const segments = group.querySelectorAll(
    '[data-reka-date-field-segment], [data-reka-time-field-segment]',
  )
  expect(segments.length).toBeGreaterThan(0)
  for (const segment of segments) expect(segment).toHaveClass('segment', 'my-segment')
  expect(screen.getByText(name)).toHaveClass('my-label')
  expect(screen.getByText('Help')).toHaveClass('description', 'my-description')
}

describe('date and time field classes', () => {
  it('adds classes to the parts of a date field', async () => {
    renderWithModel(GsDateField, parseDate('2026-11-13'), {
      label: 'Departure',
      description: 'Help',
      classes: fieldClasses,
    })
    await expectFieldClasses(/^Departure/)
  })

  it('adds classes to the parts of a time field', async () => {
    renderWithModel(GsTimeField, new Time(14, 30), {
      label: 'ETA',
      description: 'Help',
      classes: fieldClasses,
    })
    await expectFieldClasses(/^ETA/)
  })

  it('adds the error class', () => {
    renderWithModel(GsTimeField, null, {
      label: 'ETA',
      errorMessage: 'Required',
      classes: fieldClasses,
    })
    expect(screen.getByText('Required')).toHaveClass('error', 'my-error')
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
  it('normalizes strings, RGBA tuples and Colors', () => {
    expect(toHex('#1484F4')).toBe('#1484f4')
    expect(toHex([255, 0, 51])).toBe('#ff0033')
    expect(toHex([255, 0, 51, 128])).toBe('#ff003380')
    expect(toHex([300, -4, 51])).toBe('#ff0033')
    expect(toHex(convertToHsl(parseColor('#1484f4')))).toBe('#1484f4')
  })
})

describe('GsColorPicker', () => {
  function setup(initial: GsColorInput | undefined, props: Record<string, unknown> = {}) {
    const model = shallowRef<GsColorInput | undefined>(initial)
    render(() =>
      h(GsColorPicker, {
        label: 'Track color',
        items: ['#1484f4', [14, 143, 55, 255]],
        ...props,
        modelValue: model.value,
        'onUpdate:modelValue': (v?: GsColorInput) => (model.value = v),
      }),
    )
    return model
  }

  it('selects a swatch as a hex string', async () => {
    const model = setup('#1484f4')
    expect(screen.getByRole('group', { name: /Track color/ })).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(options[1]!)
    expect(model.value).toBe('#0e8f37')
  })

  it('updates a model bound to an RGBA tuple with tuples', async () => {
    const model = setup([20, 132, 244, 255])
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getAllByRole('option')[1]!)
    expect(model.value).toEqual([14, 143, 55, 255])
  })

  it('updates a model bound to a Color with Colors in the same color space', async () => {
    const model = setup(parseColor('#1484f4'))
    await userEvent.click(screen.getAllByRole('option')[1]!)
    expect(model.value).toEqual({ space: 'rgb', r: 14, g: 143, b: 55, alpha: 1 })

    const hsl = setup(convertToHsl(parseColor('#0e8f37')))
    await userEvent.click(screen.getAllByRole('option', { selected: false }).at(-1)!)
    expect(hsl.value).toMatchObject({ space: 'hsl' })
    expect(toHex(hsl.value!)).toBe('#1484f4')
  })

  it('keeps the bound format after choosing no color', async () => {
    const model = setup([20, 132, 244, 255], { allowEmpty: true })
    await userEvent.click(screen.getByRole('button', { name: 'No color' }))
    expect(model.value).toBeUndefined()
    await userEvent.click(screen.getAllByRole('option')[1]!)
    expect(model.value).toEqual([14, 143, 55, 255])
  })

  it('uses `format` while nothing is bound', async () => {
    const model = setup(undefined, { format: 'color' })
    await userEvent.click(screen.getAllByRole('option')[0]!)
    expect(model.value).toEqual({ space: 'rgb', r: 20, g: 132, b: 244, alpha: 1 })
  })

  it('accepts Color objects as swatches', async () => {
    const model = setup(undefined, {
      items: [parseColor('#ff0000'), 'hsl(120, 100%, 50%)', parseColor('rgb(255, 0, 0)')],
    })
    // The duplicate red is shown once.
    expect(screen.getAllByRole('option')).toHaveLength(2)
    await userEvent.click(screen.getAllByRole('option')[1]!)
    expect(model.value).toBe('#00ff00')
  })

  it('clears to undefined with the leading no-color option', async () => {
    const model = setup(undefined, { allowEmpty: true })
    const noColor = screen.getByRole('button', { name: 'No color' })
    // DOM order is reading order: the button comes before the swatches.
    expect(
      noColor.compareDocumentPosition(screen.getByRole('listbox')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(noColor).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getAllByRole('option')[0]!)
    expect(noColor).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(noColor)
    expect(model.value).toBeUndefined()
    expect(noColor).toHaveAttribute('aria-pressed', 'true')
  })

  it('offers a custom color button', () => {
    setup('#ff0000', { showCustomPicker: true })
    expect(screen.getByRole('button', { name: 'Custom color' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('adds classes to the inner parts', () => {
    setup('#1484f4', {
      classes: { label: 'my-label', picker: 'my-picker', item: 'my-item', swatch: 'my-swatch' },
    })
    expect(screen.getByText(/^Track color/)).toHaveClass('label', 'my-label')
    expect(screen.getByRole('listbox')).toHaveClass('picker', 'my-picker')
    for (const option of screen.getAllByRole('option')) {
      expect(option).toHaveClass('item', 'my-item')
      expect(option.firstElementChild).toHaveClass('swatch', 'my-swatch')
    }
  })
})

describe('GsNoColorButton', () => {
  it('is a plain button unless `active` is set', async () => {
    const onClick = vi.fn()
    render(GsNoColorButton, { attrs: { onClick } })
    const button = screen.getByRole('button', { name: 'No color' })
    expect(button).not.toHaveAttribute('aria-pressed')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('shows its state with `active` and can be disabled', () => {
    render(GsNoColorButton, { props: { active: true, disabled: true } })
    const button = screen.getByRole('button', { name: 'No color' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toBeDisabled()
  })
})

describe('GsCustomColorPicker', () => {
  it('edits the color in the format of the bound value', async () => {
    const model = shallowRef<GsColorInput>([48, 210, 126, 255])
    render(() =>
      h(GsCustomColorPicker, {
        modelValue: model.value,
        'onUpdate:modelValue': (v: GsColorInput) => (model.value = v),
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Custom color' }))
    const red = await screen.findByRole('textbox', { name: 'red' })
    await userEvent.clear(red)
    await userEvent.type(red, '255{Enter}')
    expect(model.value).toEqual([255, 210, 126, 255])
  })

  it('can be disabled', () => {
    render(GsCustomColorPicker, { props: { disabled: true } })
    expect(screen.getByRole('button', { name: 'Custom color' })).toBeDisabled()
  })
})

describe('color formats', () => {
  it('converts a color to each format', () => {
    const color = parseColor('#ff003380')
    expect(formatColor(color, 'hex')).toBe('#ff003380')
    expect(formatColor(color, 'rgba')).toEqual([255, 0, 51, 128])
    expect(formatColor(color, 'color')).toBe(color)
    expect(formatColor(color, 'color', convertToHsl(parseColor('#000')))).toMatchObject({
      space: 'hsl',
    })
  })
})
