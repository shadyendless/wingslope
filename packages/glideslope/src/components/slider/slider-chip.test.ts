import { fireEvent, render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { h, ref } from 'vue'
import GsChip from '../chip/GsChip.vue'
import GsChipList from '../chip/GsChipList.vue'
import GsDeletableChip from '../chip/GsDeletableChip.vue'
import GsSelectableChip from '../chip/GsSelectableChip.vue'
import GsSlider from './GsSlider.vue'
import { normalizeMarkers, parseInputValue, snapToMarker } from './markers'

function renderSlider(initial: number | number[], props: Record<string, unknown> = {}) {
  const model = ref(initial)
  render(() =>
    h(GsSlider, {
      label: 'Opacity',
      ...props,
      modelValue: model.value,
      'onUpdate:modelValue': (v: number | number[] | undefined) => (model.value = v ?? initial),
    }),
  )
  return model
}

describe('slider markers', () => {
  it('spreads a marker count evenly', () => {
    expect(normalizeMarkers(5, 0, 100).map((m) => m.value)).toEqual([0, 25, 50, 75, 100])
  })

  it('snaps to the nearest marker', () => {
    const markers = normalizeMarkers([0, 10, 50], 0, 100)
    expect(snapToMarker(28, markers)).toBe(10)
    expect(snapToMarker(31, markers)).toBe(50)
  })

  it('clamps typed values and treats junk as min', () => {
    expect(parseInputValue('150', 0, 100)).toBe(100)
    expect(parseInputValue('abc', 0, 100)).toBe(0)
  })
})

describe('GsSlider', () => {
  it('exposes a labeled slider thumb that steps with the keyboard', async () => {
    const model = renderSlider(40)
    // Reka UI mounts the thumbs after the root.
    const thumb = await screen.findByRole('slider', { name: 'Opacity' })
    expect(thumb).toHaveAttribute('aria-valuenow', '40')
    expect(screen.getByRole('group', { name: 'Opacity' })).toBeInTheDocument()

    thumb.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(model.value).toBe(41)
  })

  it('names both thumbs of a range', async () => {
    renderSlider([20, 80])
    expect(await screen.findByRole('slider', { name: 'Opacity, minimum' })).toHaveAttribute(
      'aria-valuenow',
      '20',
    )
    expect(screen.getByRole('slider', { name: 'Opacity, maximum' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    )
  })

  it('snaps to markers', async () => {
    const model = renderSlider(50, { markers: [0, 50, 100], snapToMarkers: true })
    ;(await screen.findByRole('slider')).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(model.value).toBe(50)
    await userEvent.keyboard('{End}')
    expect(model.value).toBe(100)
  })

  it('adds classes to its parts', async () => {
    renderSlider(50, {
      showInput: true,
      markers: [{ value: 0, label: 'Low' }, { value: 100 }],
      showMarkerLabels: true,
      classes: {
        label: 'my-label',
        inputs: 'my-inputs',
        input: 'my-input',
        track: 'my-track',
        trackBackground: 'my-track-background',
        trackValue: 'my-track-value',
        thumb: 'my-thumb',
        minValue: 'my-min',
        maxValue: 'my-max',
        markers: 'my-markers',
        marker: 'my-marker',
        markerDot: 'my-marker-dot',
        markerLabel: 'my-marker-label',
      },
    })
    expect(await screen.findByRole('slider')).toHaveClass('thumb', 'my-thumb')
    const input = screen.getByRole('textbox', { name: 'Opacity' })
    expect(input).toHaveClass('input', 'my-input')
    expect(input.parentElement).toHaveClass('inputs', 'my-inputs')
    expect(screen.getByText('Opacity')).toHaveClass('label', 'my-label')
    expect(screen.getByText('Low')).toHaveClass('markerLabel', 'my-marker-label')
    expect(screen.getByText('100')).toHaveClass('maxValue', 'my-max')
    // Hidden behind the labeled marker at 0, but still carries the class.
    expect(document.querySelector('.minValue')).toHaveClass('my-min')
    for (const [part, custom] of [
      ['track', 'my-track'],
      ['trackBackground', 'my-track-background'],
      ['range', 'my-track-value'],
      ['markers', 'my-markers'],
      ['marker', 'my-marker'],
      ['markerDot', 'my-marker-dot'],
    ]) {
      expect(document.querySelector(`.${part}`)).toHaveClass(custom!)
    }
  })

  it('accepts typed values in the inputs', async () => {
    const model = renderSlider(10, { showInput: true })
    const input = screen.getByRole('textbox', { name: 'Opacity' })
    await fireEvent.update(input, '65')
    await fireEvent.change(input)
    expect(model.value).toBe(65)
  })
})

describe('GsChip', () => {
  it('renders static content outside a list', () => {
    render(GsChip, { props: { color: 'normal' }, slots: { default: () => 'Online' } })
    const chip = screen.getByText('Online')
    expect(chip).toHaveAttribute('data-color', 'normal')
    expect(chip).toHaveAttribute('data-size', 'medium')
  })
})

describe('GsChipList', () => {
  it('selects chips into v-model', async () => {
    const model = ref<string[]>([])
    render(() =>
      h(
        GsChipList,
        {
          'aria-label': 'Filters',
          selectionMode: 'multiple',
          modelValue: model.value,
          'onUpdate:modelValue': (v: unknown) => (model.value = v as string[]),
        },
        () => [
          h(GsSelectableChip, { value: 'air' }, () => 'Air'),
          h(GsSelectableChip, { value: 'sea' }, () => 'Sea'),
        ],
      ),
    )
    expect(screen.getByRole('grid', { name: 'Filters' })).toBeInTheDocument()
    await userEvent.click(screen.getByText('Sea'))
    expect(model.value).toEqual(['sea'])
    expect(screen.getByRole('row', { name: 'Sea' })).toHaveAttribute('aria-selected', 'true')
  })

  it('emits remove from the remove button and from Backspace', async () => {
    const removed: unknown[][] = []
    render(() =>
      h(
        GsChipList,
        { 'aria-label': 'Assignees', onRemove: (v: unknown[]) => removed.push(v) },
        () => [
          h(GsDeletableChip, { value: 'jo' }, () => 'Jo'),
          h(GsDeletableChip, { value: 'sam' }, () => 'Sam'),
        ],
      ),
    )
    const removeButtons = screen.getAllByRole('button', { name: /Remove/ })
    await userEvent.click(removeButtons[0]!)
    expect(removed).toEqual([['jo']])

    screen.getByRole('row', { name: 'Sam' }).focus()
    await userEvent.keyboard('{Backspace}')
    expect(removed).toEqual([['jo'], ['sam']])
  })

  it('keeps the last chip selected with disallowEmptySelection', async () => {
    const model = ref<string>('air')
    render(() =>
      h(
        GsChipList,
        {
          'aria-label': 'Domain',
          selectionMode: 'single',
          disallowEmptySelection: true,
          modelValue: model.value,
          'onUpdate:modelValue': (v: unknown) => (model.value = v as string),
        },
        () => [
          h(GsSelectableChip, { value: 'air' }, () => 'Air'),
          h(GsSelectableChip, { value: 'sea' }, () => 'Sea'),
        ],
      ),
    )
    await userEvent.click(screen.getByText('Air'))
    expect(model.value).toBe('air')

    screen.getByRole('row', { name: 'Air' }).focus()
    await userEvent.keyboard('{Escape}')
    expect(model.value).toBe('air')

    await userEvent.click(screen.getByText('Sea'))
    expect(model.value).toBe('sea')
  })

  it('allows deselecting every chip by default', async () => {
    const model = ref<string | undefined>('air')
    render(() =>
      h(
        GsChipList,
        {
          'aria-label': 'Domain',
          selectionMode: 'single',
          modelValue: model.value,
          'onUpdate:modelValue': (v: unknown) => (model.value = v as string | undefined),
        },
        () => h(GsSelectableChip, { value: 'air' }, () => 'Air'),
      ),
    )
    await userEvent.click(screen.getByText('Air'))
    expect(model.value).toBeUndefined()
  })

  it('adds a class to the remove button of a deletable chip', () => {
    render(() =>
      h(GsChipList, { 'aria-label': 'Tags', onRemove: () => {} }, () =>
        h(GsDeletableChip, { value: 'a', classes: { remove: 'my-remove' } }, () => 'Alpha'),
      ),
    )
    expect(screen.getByRole('button', { name: /Remove/ })).toHaveClass('remove', 'my-remove')
  })

  it('leaves chips non-removable without a remove listener', async () => {
    render(() =>
      h(GsChipList, { 'aria-label': 'Tags' }, () => h(GsChip, { value: 'a' }, () => 'Alpha')),
    )
    screen.getByRole('row', { name: 'Alpha' }).focus()
    await userEvent.keyboard('{Backspace}')
    expect(screen.getByRole('row', { name: 'Alpha' })).toBeInTheDocument()
  })
})
