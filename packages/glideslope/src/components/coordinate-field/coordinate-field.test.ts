import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { FormRoot } from 'reka-ui'
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import { provideCoordinateFieldDefaults } from './defaults'
import GsCoordinateField from './GsCoordinateField.vue'
import type { GsCoordinateFieldDefaults, GsCoordinateValue } from './types'

const newYorkCity: GsCoordinateValue = { lat: 40.7128, lon: -74.006 }

function renderField(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return render(GsCoordinateField, { props: { label: 'Location', ...props }, slots })
}

/** Renders the field with a reactive `v-model` and returns the model ref. */
function withModel(initial: GsCoordinateValue | null, props: Record<string, unknown> = {}) {
  const model = ref<GsCoordinateValue | null>(initial)
  const result = render(() =>
    h(GsCoordinateField, {
      label: 'Location',
      ...props,
      modelValue: model.value,
      'onUpdate:modelValue': (value: GsCoordinateValue | null) => (model.value = value),
    }),
  )
  return { model, ...result }
}

function withDefaults(defaults: GsCoordinateFieldDefaults, props: Record<string, unknown> = {}) {
  const Host = defineComponent({
    setup() {
      provideCoordinateFieldDefaults(defaults)
      return () => h(GsCoordinateField, { label: 'Location', ...props })
    },
  })
  return render(Host)
}

const input = (name: string) => screen.getByLabelText<HTMLInputElement>(name)
const formatButton = () =>
  screen.getByRole<HTMLButtonElement>('button', { name: /view coordinate in all formats/i })

describe('GsCoordinateField', () => {
  describe('basic rendering', () => {
    it('renders the label, description and a labelled group', async () => {
      renderField({ description: 'Enter location coordinates' })
      expect(screen.getByText('Enter location coordinates')).toBeInTheDocument()
      expect(await screen.findByRole('group', { name: /Location/ })).toBeInTheDocument()
    })

    it('renders the error message when invalid', () => {
      renderField({ invalid: true, errorMessage: 'Invalid coordinate format' })
      expect(screen.getByText('Invalid coordinate format')).toBeInTheDocument()
    })

    it('hides the label at small size and names the group instead', () => {
      const { container } = renderField({ size: 'small' })
      expect(screen.queryByText(/Location/)).toBeNull()
      expect(screen.getByRole('group', { name: 'Location' })).toBeInTheDocument()
      expect(container.firstElementChild).toHaveAttribute('data-size', 'small')
    })

    it('marks the field disabled', () => {
      const { container } = renderField({ disabled: true })
      expect(container.firstElementChild).toHaveAttribute('data-disabled')
      expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('segments by format', () => {
    it.each([
      ['dd', 2],
      ['ddm', 6],
      ['dms', 8],
      ['mgrs', 5],
      ['utm', 4],
    ])('renders the %s segments', (format, count) => {
      renderField({ format })
      expect(screen.getAllByRole('textbox')).toHaveLength(count)
    })

    it('renders literal separators', () => {
      const dd = renderField({ format: 'dd' })
      expect(dd.container.textContent).toContain(',')
      dd.unmount()
      const dms = renderField({ format: 'dms' })
      expect(dms.container.textContent).toContain('°')
      expect(dms.container.textContent).toContain("'")
      expect(dms.container.textContent).toContain('"')
    })

    it('splits latitude and longitude into rows when stacked', () => {
      const { container } = renderField({ format: 'ddm', variant: 'stacked' })
      const rows = container.querySelectorAll('.segmentGroup')
      expect(rows).toHaveLength(2)
      expect(within(rows[0] as HTMLElement).getAllByRole('textbox')).toHaveLength(3)
      expect(container.textContent).not.toContain(',')
    })
  })

  describe('keyboard navigation', () => {
    it('moves between segments with Tab and Shift+Tab', async () => {
      const user = userEvent.setup()
      renderField()
      await user.click(input('Latitude'))
      await user.keyboard('{Tab}')
      expect(input('Longitude')).toHaveFocus()
      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(input('Latitude')).toHaveFocus()
    })

    it('moves to the next segment with ArrowRight at the end', async () => {
      const user = userEvent.setup()
      renderField()
      await user.type(input('Latitude'), '40')
      await user.keyboard('{ArrowRight}')
      expect(input('Longitude')).toHaveFocus()
    })

    it('moves to the previous segment with ArrowLeft at the start', async () => {
      const user = userEvent.setup()
      renderField()
      await user.type(input('Latitude'), '40')
      await user.click(input('Longitude'))
      await user.keyboard('{ArrowLeft}')
      expect(input('Latitude')).toHaveFocus()
    })

    it('jumps to the first and last segments with Home and End', async () => {
      const user = userEvent.setup()
      renderField({ format: 'dms' })
      await user.click(input('Latitude minutes'))
      await user.keyboard('{End}')
      expect(input('Longitude direction')).toHaveFocus()
      await user.keyboard('{Home}')
      expect(input('Latitude degrees')).toHaveFocus()
    })

    it('auto-advances when a segment is full', async () => {
      const user = userEvent.setup()
      renderField({ format: 'ddm' })
      await user.type(input('Latitude degrees'), '90')
      await waitFor(() => expect(input('Latitude minutes')).toHaveFocus())
    })

    it('retreats on Backspace in an empty segment, and deletes otherwise', async () => {
      const user = userEvent.setup()
      renderField()
      await user.type(input('Latitude'), '40')
      await user.keyboard('{Backspace}')
      expect(input('Latitude').value).toBe('4')

      await user.click(input('Longitude'))
      await user.keyboard('{Backspace}')
      expect(input('Latitude')).toHaveFocus()
    })

    it('selects the content on focus', async () => {
      const user = userEvent.setup()
      renderField({ defaultValue: newYorkCity })
      const lat = input('Latitude')
      await user.click(lat)
      expect(lat.selectionStart).toBe(0)
      expect(lat.selectionEnd).toBe(lat.value.length)
    })
  })

  describe('character filtering', () => {
    it('only accepts digits in numeric segments', async () => {
      const user = userEvent.setup()
      renderField({ format: 'ddm' })
      await user.type(input('Latitude degrees'), 'abc123xyz')
      expect(input('Latitude degrees').value).toBe('12')
    })

    it('accepts a minus sign and decimals in DD segments', async () => {
      const user = userEvent.setup()
      renderField()
      await user.type(input('Latitude'), '!@#-40.7128')
      expect(input('Latitude').value).toBe('-40.7128')
    })

    it('only accepts N/S and E/W in direction segments, in either case', async () => {
      const user = userEvent.setup()
      renderField({ format: 'ddm' })
      await user.type(input('Latitude direction'), 'ABCn')
      expect(input('Latitude direction').value).toBe('n')
      await user.type(input('Longitude direction'), 'ABCE')
      expect(input('Longitude direction').value).toBe('E')
    })

    it('accepts a direction letter pasted in either case', async () => {
      const user = userEvent.setup()
      renderField({ format: 'ddm' })
      await user.click(input('Latitude direction'))
      await user.paste('s')
      expect(input('Latitude direction').value).toBe('s')
    })

    it('respects the segment length', async () => {
      const user = userEvent.setup()
      renderField({ format: 'ddm' })
      await user.type(input('Latitude degrees'), '123456')
      expect(input('Latitude degrees').value.length).toBeLessThanOrEqual(2)
    })

    it('uppercases MGRS letters and pads a one-digit zone on blur', async () => {
      const user = userEvent.setup()
      renderField({ format: 'mgrs' })
      await user.type(input('MGRS zone'), '6')
      await user.click(input('MGRS band'))
      expect(input('MGRS zone').value).toBe('06')
      await user.keyboard('r')
      expect(input('MGRS band').value).toBe('R')
    })
  })

  describe('value and validation', () => {
    it('shows a v-model value in the format, and converts it when the format changes', async () => {
      const field = renderField({ modelValue: newYorkCity, format: 'dd' })
      expect(input('Latitude').value).toBe('40.7128')
      expect(input('Longitude').value).toBe('-74.006')

      await field.rerender({ modelValue: newYorkCity, format: 'ddm' })
      expect(screen.getAllByRole('textbox')).toHaveLength(6)
      expect(input('Latitude degrees').value).toBe('40')
      expect(input('Latitude direction').value).toBe('N')
    })

    it('starts from default-value without v-model', () => {
      renderField({ defaultValue: newYorkCity })
      expect(input('Latitude').value).toBe('40.7128')
    })

    it('starts empty without a value', () => {
      renderField({ modelValue: null })
      for (const segment of screen.getAllByRole<HTMLInputElement>('textbox')) {
        expect(segment.value).toBe('')
      }
    })

    it('updates v-model once every segment is filled with a valid coordinate', async () => {
      const user = userEvent.setup()
      const { model } = withModel(null)
      await user.type(input('Latitude'), '40.7128')
      expect(model.value).toBeNull()
      await user.type(input('Longitude'), '-74.0060')
      await waitFor(() => expect(model.value).not.toBeNull())
      expect(model.value?.lat).toBeCloseTo(40.7128, 4)
      expect(model.value?.lon).toBeCloseTo(-74.006, 3)
    })

    it('validates at once when a segment loses focus', async () => {
      const user = userEvent.setup()
      const { model } = withModel(null)
      await user.type(input('Latitude'), '10')
      await user.type(input('Longitude'), '20')
      await user.tab()
      expect(model.value).toEqual({ lat: 10, lon: 20 })
    })

    it.each([
      ['90', '0', { lat: 90, lon: 0 }],
      ['-90', '0', { lat: -90, lon: 0 }],
      ['0', '180', { lat: 0, lon: 180 }],
      ['0', '-180', { lat: 0, lon: -180 }],
    ])('accepts the boundary %s, %s', async (lat, lon, expected) => {
      const user = userEvent.setup()
      const { model } = withModel(null)
      await user.type(input('Latitude'), lat)
      await user.type(input('Longitude'), lon)
      await waitFor(() => expect(model.value).toEqual(expected))
    })

    it.each([
      ['91', '0'],
      ['0', '181'],
    ])('rejects %s, %s with an error and a null value', async (lat, lon) => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      const onError = vi.fn()
      renderField({ 'onUpdate:modelValue': onUpdate, onError })
      await user.type(input('Latitude'), lat)
      await user.type(input('Longitude'), lon)

      expect(await screen.findByText('Invalid coordinate value')).toBeInTheDocument()
      // The value stays null; `v-model` emits only changes.
      expect(onUpdate.mock.calls.every(([value]) => value === null)).toBe(true)
      expect(onError).toHaveBeenCalledWith(
        'Invalid coordinate value',
        expect.objectContaining({ format: 'dd', segments: [lat, lon] }),
      )
      expect(screen.getByRole('group')).toHaveAttribute('aria-invalid', 'true')
    })

    it('clears the error when the input is corrected', async () => {
      const user = userEvent.setup()
      renderField()
      await user.type(input('Latitude'), '91')
      await user.type(input('Longitude'), '0')
      expect(await screen.findByText('Invalid coordinate value')).toBeInTheDocument()

      await user.clear(input('Latitude'))
      await waitFor(() => expect(screen.queryByText('Invalid coordinate value')).toBeNull())
    })

    it('shows no error for partial input', async () => {
      const user = userEvent.setup()
      renderField()
      await user.type(input('Latitude'), '40')
      await new Promise((resolve) => setTimeout(resolve, 450))
      expect(screen.queryByText(/invalid/i)).toBeNull()
    })

    it('keeps the other segments when one is cleared with v-model', async () => {
      const user = userEvent.setup()
      const { model } = withModel(newYorkCity)
      await user.clear(input('Latitude'))
      await waitFor(() => expect(model.value).toBeNull())
      expect(input('Latitude').value).toBe('')
      expect(input('Longitude').value).toBe('-74.006')
    })

    it('keeps an invalid entry and its error with v-model', async () => {
      const user = userEvent.setup()
      withModel(newYorkCity)
      await user.clear(input('Latitude'))
      await user.type(input('Latitude'), '95')
      expect(await screen.findByText('Invalid coordinate value')).toBeInTheDocument()
      expect(input('Latitude').value).toBe('95')
    })

    it('converts a new value set from outside', async () => {
      const { model } = withModel(null)
      model.value = { lat: -33.8688, lon: 151.2093 }
      await waitFor(() => expect(input('Latitude').value).toBe('-33.8688'))
    })
  })

  describe('format popover', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn(() => Promise.resolve()), readText: vi.fn() },
        writable: true,
        configurable: true,
      })
    })

    it('shows the format button at both sizes, unless show-format-button is false', () => {
      const medium = renderField({ modelValue: newYorkCity })
      expect(formatButton()).toBeInTheDocument()
      medium.unmount()
      const small = renderField({ modelValue: newYorkCity, size: 'small' })
      expect(formatButton()).toBeInTheDocument()
      small.unmount()
      renderField({ modelValue: newYorkCity, showFormatButton: false })
      expect(screen.queryByRole('button', { name: /view coordinate/i })).toBeNull()
    })

    it('enables the format button only for a valid coordinate', async () => {
      const user = userEvent.setup()
      const empty = renderField()
      expect(formatButton()).toBeDisabled()
      await user.type(input('Latitude'), '91')
      await user.type(input('Longitude'), '0')
      await screen.findByText('Invalid coordinate value')
      expect(formatButton()).toBeDisabled()
      empty.unmount()

      renderField({ modelValue: newYorkCity })
      expect(formatButton()).toBeEnabled()
    })

    it('renders the icon slot in the format button', () => {
      renderField(
        { modelValue: newYorkCity },
        { icon: () => h('svg', { 'data-testid': 'custom-icon' }) },
      )
      expect(within(formatButton()).getByTestId('custom-icon')).toBeInTheDocument()
    })

    it('opens with a click or Enter and lists every format', async () => {
      const user = userEvent.setup()
      renderField({ modelValue: newYorkCity })
      formatButton().focus()
      await user.keyboard('{Enter}')

      const popover = await screen.findByRole('dialog', { name: 'Copy Coordinates' })
      for (const label of ['DD', 'DDM', 'DMS', 'MGRS', 'UTM']) {
        expect(within(popover).getByText(label)).toBeInTheDocument()
      }
      expect(within(popover).getByText('40.7128 N / 74.006 W')).toBeInTheDocument()
      expect(within(popover).getByText('18T WL 83959 07350')).toBeInTheDocument()
    })

    it('copies a format and shows a confirmation', async () => {
      const user = userEvent.setup()
      const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
      renderField({ modelValue: newYorkCity })
      await user.click(formatButton())

      const copyButtons = await screen.findAllByRole('button', { name: /Copy .* format/ })
      expect(copyButtons).toHaveLength(5)
      await user.click(screen.getByRole('button', { name: 'Copy DD format' }))
      expect(writeText).toHaveBeenCalledWith('40.7128 N / 74.006 W')
    })

    it('disables copying MGRS and UTM near the poles', async () => {
      const user = userEvent.setup()
      renderField({ modelValue: { lat: 89, lon: 0 } })
      await user.click(formatButton())
      expect(await screen.findByRole('button', { name: 'Copy MGRS format' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Copy UTM format' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Copy DD format' })).toBeEnabled()
      expect(screen.getAllByText('Not available at poles')).toHaveLength(2)
    })
  })

  describe('paste handling', () => {
    it.each([
      ['dd', 'Latitude', '40.7128, -74.0060'],
      ['ddm', 'Latitude degrees', "40° 42.768' N, 74° 0.360' W"],
      ['dms', 'Latitude degrees', '40° 42\' 46.08" N, 74° 0\' 21.60" W'],
      ['mgrs', 'MGRS zone', '18T WL 80654 06346'],
      ['utm', 'UTM zone', '18N 585628 4511644'],
    ])('applies a whole %s coordinate pasted into a segment', async (format, segment, text) => {
      const user = userEvent.setup()
      const { model } = withModel(null, { format })
      input(segment).focus()
      await user.paste(text)
      await waitFor(() => expect(model.value).not.toBeNull())
      // The MGRS and UTM examples are a few kilometres from the DD one.
      expect(model.value?.lat).toBeCloseTo(40.7128, 1)
      expect(model.value?.lon).toBeCloseTo(-74.006, 1)
    })

    it('converts a pasted coordinate to the current format and focuses the first segment', async () => {
      const user = userEvent.setup()
      renderField({ format: 'ddm' })
      input('Longitude minutes').focus()
      await user.paste('40.7128, -74.0060')
      await waitFor(() => expect(input('Latitude degrees').value).toBe('40'))
      expect(input('Latitude direction').value).toBe('N')
      expect(input('Longitude direction').value).toBe('W')
      await waitFor(() => expect(input('Latitude degrees')).toHaveFocus())
    })

    it('normalizes a lowercase MGRS paste with a one-digit zone', async () => {
      const user = userEvent.setup()
      const { model } = withModel(null, { format: 'mgrs' })
      input('MGRS zone').focus()
      await user.paste('6r yp 12345 67890')
      await waitFor(() => expect(model.value).not.toBeNull())
      expect(input('MGRS zone').value).toBe('06')
      expect(input('MGRS band').value).toBe('R')
    })

    it('applies without asking when every match is the same location', async () => {
      const user = userEvent.setup()
      const { model } = withModel(null)
      input('Latitude').focus()
      await user.paste('40° 0\' 0" N, 74° 0\' 0" W')
      await waitFor(() => expect(model.value).not.toBeNull())
      expect(model.value?.lat).toBeCloseTo(40, 3)
      expect(model.value?.lon).toBeCloseTo(-74, 3)
      expect(screen.queryByText(/Select Coordinate Format/)).toBeNull()
    })

    it('emits an error for an invalid coordinate and shows nothing by itself', async () => {
      const user = userEvent.setup()
      const onError = vi.fn()
      renderField({ onError })
      input('Latitude').focus()
      await user.paste('99.9999, 999.9999')
      expect(onError).toHaveBeenCalledWith('Invalid coordinate format', {
        pastedText: '99.9999, 999.9999',
      })
      expect(screen.queryByText('Invalid coordinate format')).toBeNull()
    })

    it('lets the implementor show the paste error', async () => {
      const user = userEvent.setup()
      const Host = defineComponent({
        setup() {
          const error = ref('')
          return () =>
            h(GsCoordinateField, {
              label: 'Location',
              invalid: !!error.value,
              errorMessage: error.value,
              onError: (message: string) => (error.value = message),
            })
        },
      })
      render(Host)
      input('Latitude').focus()
      await user.paste('99.9999, 999.9999')
      expect(await screen.findByText('Invalid coordinate format')).toBeInTheDocument()
    })

    it('pastes a single value into the segment as usual', async () => {
      const user = userEvent.setup()
      renderField()
      input('Latitude').focus()
      await user.paste('42')
      expect(input('Latitude').value).toBe('42')
    })
  })

  describe('accessibility', () => {
    it('names each segment', () => {
      renderField({ format: 'utm' })
      for (const name of ['UTM zone', 'UTM hemisphere', 'UTM easting', 'UTM northing']) {
        expect(screen.getByRole('textbox', { name })).toBeInTheDocument()
      }
    })

    it('labels the group by the label and describes it by the description and error', async () => {
      renderField({ description: 'Help text' })
      const group = await screen.findByRole('group', { name: 'Location (optional)' })
      await waitFor(() =>
        expect(group).toHaveAccessibleDescription(expect.stringContaining('Help text')),
      )
    })

    it('focuses the first segment when the label is clicked', async () => {
      const user = userEvent.setup()
      renderField()
      await user.click(screen.getByText(/Location/))
      expect(input('Latitude')).toHaveFocus()
    })

    it('routes attributes to the group and classes to the wrapper', () => {
      const { container } = renderField({
        id: 'target',
        class: 'outer',
        'data-testid': 'coordinates',
        'aria-describedby': 'external-help',
      })
      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('id', 'target')
      expect(group).toHaveAttribute('data-testid', 'coordinates')
      expect(group).toHaveAttribute('aria-describedby', 'external-help')
      expect(container.firstElementChild).toHaveClass('outer', 'field')
    })

    it('uses a custom aria-label', () => {
      renderField({ label: undefined, 'aria-label': 'Target coordinates' })
      expect(screen.getByRole('group', { name: 'Target coordinates' })).toBeInTheDocument()
    })

    it('marks segments required and disabled', () => {
      const required = renderField({ required: true })
      for (const segment of screen.getAllByRole('textbox')) {
        expect(segment).toHaveAttribute('aria-required', 'true')
      }
      required.unmount()
      renderField({ disabled: true })
      for (const segment of screen.getAllByRole('textbox')) {
        expect(segment).toBeDisabled()
        expect(segment).toHaveAttribute('aria-disabled', 'true')
      }
    })

    it('takes read-only segments out of the tab order', () => {
      renderField({ readonly: true, modelValue: newYorkCity })
      for (const segment of screen.getAllByRole('textbox')) {
        expect(segment).toHaveAttribute('readonly')
        expect(segment).toHaveAttribute('tabindex', '-1')
      }
      expect(screen.getByRole('group')).toHaveAttribute('data-readonly')
    })
  })

  describe('defaults, classes and forms', () => {
    it('uses provided defaults, with props taking precedence', () => {
      const stacked = withDefaults({ format: 'dms', variant: 'stacked' })
      expect(screen.getAllByRole('textbox')).toHaveLength(8)
      stacked.unmount()
      withDefaults({ format: 'dms', showFormatButton: false }, { format: 'utm' })
      expect(screen.getAllByRole('textbox')).toHaveLength(4)
      expect(screen.queryByRole('button')).toBeNull()
    })

    it('adds classes to inner parts', () => {
      const { container } = renderField({
        description: 'Help',
        classes: {
          label: 'my-label',
          control: 'my-control',
          input: 'my-input',
          segment: 'my-segment',
          formatButton: 'my-button',
          description: 'my-description',
        },
      })
      expect(container.querySelector('label, .my-label')).toHaveClass('my-label')
      expect(screen.getByRole('group')).toHaveClass('control', 'my-control')
      expect(container.querySelector('.input')).toHaveClass('my-input')
      expect(input('Latitude')).toHaveClass('segment', 'my-segment')
      expect(formatButton()).toHaveClass('my-button')
      expect(screen.getByText('Help')).toHaveClass('my-description')
    })

    it('submits its value with a Reka form and blocks an empty required field', async () => {
      const user = userEvent.setup()
      const onFormSubmit = vi.fn()
      render(() =>
        h(FormRoot, { onFormSubmit }, () => [
          h(GsCoordinateField, { label: 'Location', name: 'location', required: true }),
          h('button', { type: 'submit' }, 'Submit'),
        ]),
      )

      await user.click(screen.getByRole('button', { name: 'Submit' }))
      expect(onFormSubmit).not.toHaveBeenCalled()
      expect(input('Latitude')).toHaveFocus()

      await user.type(input('Latitude'), '10')
      await user.type(input('Longitude'), '20')
      await user.click(screen.getByRole('button', { name: 'Submit' }))
      expect(onFormSubmit).toHaveBeenCalledWith(
        { location: { lat: 10, lon: 20 } },
        expect.anything(),
      )
    })
  })
})
