import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { h, ref } from 'vue'
import GsCheckbox from './checkbox/GsCheckbox.vue'
import GsCheckboxGroup from './checkbox/GsCheckboxGroup.vue'
import GsInput from './input/GsInput.vue'
import GsRadio from './radio/GsRadio.vue'
import GsRadioGroup from './radio/GsRadioGroup.vue'
import GsSwitch from './switch/GsSwitch.vue'
import GsSearchField from './text-field/GsSearchField.vue'
import GsTextAreaField from './text-field/GsTextAreaField.vue'
import GsTextField from './text-field/GsTextField.vue'

/** Renders a component with a reactive v-model and returns the model ref. */
function withModel<T>(
  component: object,
  initial: T,
  props: Record<string, unknown> = {},
  slots = {},
) {
  const model = ref(initial)
  const result = render(() =>
    h(
      component,
      { ...props, modelValue: model.value, 'onUpdate:modelValue': (v: T) => (model.value = v) },
      slots,
    ),
  )
  return { model, ...result }
}

describe('GsInput', () => {
  it('binds v-model and routes attributes to the input', async () => {
    const { model, container } = withModel(GsInput, '', {
      class: 'outer',
      id: 'callsign',
      'aria-label': 'Callsign',
    })
    const input = screen.getByRole('textbox', { name: 'Callsign' })
    expect(input).toHaveAttribute('id', 'callsign')
    expect(container.firstElementChild).toHaveClass('outer', 'container')

    await userEvent.type(input, 'RAVEN')
    expect(model.value).toBe('RAVEN')
  })

  it('clears with Escape and with the clear button', async () => {
    const { model } = withModel(GsInput, 'abc', { 'aria-label': 'Name' })
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '{Escape}')
    expect(model.value).toBe('')

    model.value = 'xyz'
    await userEvent.click(screen.getByRole('button', { name: 'Clear', hidden: true }))
    expect(model.value).toBe('')
    expect(input).toHaveFocus()
  })

  it('omits the clear button when not clearable or read-only', () => {
    render(GsInput, { props: { clearable: false } })
    expect(screen.queryByRole('button', { hidden: true })).toBeNull()
  })
})

describe('GsTextField', () => {
  it('labels the input and links its description', async () => {
    render(GsTextField, { props: { label: 'Callsign', description: 'As filed' } })
    const input = screen.getByRole('textbox', { name: /Callsign/ })
    expect(screen.getByText('Callsign (optional)')).toBeInTheDocument()
    // Reka registers the description on mount, so the link appears on the next render.
    await waitFor(() => expect(input).toHaveAccessibleDescription('As filed'))
  })

  it('shows an error message, marks the input invalid and hides the description', async () => {
    render(GsTextField, {
      props: { label: 'Callsign', description: 'As filed', errorMessage: 'Unknown callsign' },
    })
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(input).toHaveAccessibleDescription('Unknown callsign'))
    expect(screen.queryByText('As filed')).toBeNull()
  })

  it('uses the label as aria-label at small size', () => {
    render(GsTextField, { props: { label: 'Callsign', size: 'small' } })
    expect(screen.queryByText(/Callsign/)).toBeNull()
    expect(screen.getByRole('textbox', { name: 'Callsign' })).toBeInTheDocument()
  })

  it('runs custom validation', async () => {
    withModel(GsTextField, '', {
      label: 'Code',
      validationMode: 'onChange',
      validate: (value: unknown) => (String(value).length < 3 ? 'Too short' : null),
    })
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'ab')
    expect(await screen.findByText('Too short')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')

    await userEvent.type(input, 'c')
    expect(screen.queryByText('Too short')).toBeNull()
  })

  it('binds v-model through the field', async () => {
    const { model } = withModel(GsTextField, '', { label: 'Callsign' })
    await userEvent.type(screen.getByRole('textbox'), 'RAVEN 21')
    expect(model.value).toBe('RAVEN 21')
  })
})

describe('GsTextAreaField', () => {
  it('renders a labeled textarea with v-model', async () => {
    const { model } = withModel(GsTextAreaField, '', { label: 'Notes', required: true })
    const textarea = screen.getByRole('textbox', { name: 'Notes' })
    expect(textarea.tagName).toBe('TEXTAREA')
    expect(textarea).toBeRequired()
    await userEvent.type(textarea, 'Line one')
    expect(model.value).toBe('Line one')
  })
})

describe('GsSearchField', () => {
  it('emits submit on Enter and clear on Escape', async () => {
    const submitted: string[] = []
    let cleared = 0
    const model = ref('')
    render(() =>
      h(GsSearchField, {
        'aria-label': 'Search tracks',
        modelValue: model.value,
        'onUpdate:modelValue': (v: string) => (model.value = v),
        onSubmit: (v: string) => submitted.push(v),
        onClear: () => cleared++,
      }),
    )
    const input = screen.getByRole('searchbox', { name: 'Search tracks' })
    await userEvent.type(input, 'raven{Enter}')
    expect(submitted).toEqual(['raven'])

    await userEvent.type(input, '{Escape}')
    expect(model.value).toBe('')
    expect(cleared).toBe(1)
  })

  it('shows a loading status instead of the clear button', () => {
    render(GsSearchField, { props: { loading: true }, attrs: { 'aria-label': 'Search' } })
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { hidden: true })).toBeNull()
  })
})

describe('GsCheckbox', () => {
  it('uses its label as the accessible name and toggles v-model', async () => {
    const { model } = withModel(GsCheckbox, false, {}, { default: () => 'Acknowledge' })
    const checkbox = screen.getByRole('checkbox', { name: 'Acknowledge' })
    await userEvent.click(checkbox)
    expect(model.value).toBe(true)
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
    expect(checkbox).toHaveAttribute('data-state', 'checked')
  })

  it('supports the indeterminate state', () => {
    withModel(GsCheckbox, 'indeterminate', {}, { default: () => 'All' })
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
  })
})

describe('GsCheckboxGroup', () => {
  it('collects checked values into an array', async () => {
    const { model } = withModel(
      GsCheckboxGroup,
      ['tracks'] as string[],
      { label: 'Layers' },
      {
        default: () => [
          h(GsCheckbox, { value: 'tracks' }, () => 'Tracks'),
          h(GsCheckbox, { value: 'airspace' }, () => 'Airspace'),
        ],
      },
    )
    expect(screen.getByRole('group', { name: /Layers/ })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Tracks' })).toBeChecked()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Airspace' }))
    expect(model.value).toEqual(['tracks', 'airspace'])
  })
})

describe('GsRadioGroup', () => {
  it('selects one value', async () => {
    const { model } = withModel(
      GsRadioGroup,
      'metric',
      { label: 'Units' },
      {
        default: () => [
          h(GsRadio, { value: 'metric' }, () => 'Metric'),
          h(GsRadio, { value: 'imperial' }, () => 'Imperial'),
        ],
      },
    )
    expect(screen.getByRole('radiogroup', { name: /Units/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Metric' })).toBeChecked()

    await userEvent.click(screen.getByRole('radio', { name: 'Imperial' }))
    expect(model.value).toBe('imperial')
    expect(screen.getByRole('radio', { name: 'Metric' })).not.toBeChecked()
  })
})

describe('GsSwitch', () => {
  it('toggles v-model', async () => {
    const { model } = withModel(GsSwitch, false, {}, { default: () => 'Show grid' })
    const toggle = screen.getByRole('switch', { name: 'Show grid' })
    await userEvent.click(toggle)
    expect(model.value).toBe(true)
    expect(toggle).toHaveAttribute('data-state', 'checked')
  })

  it('does not toggle when disabled', async () => {
    const { model } = withModel(GsSwitch, false, { disabled: true }, { default: () => 'Grid' })
    await userEvent.click(screen.getByRole('switch'))
    expect(model.value).toBe(false)
  })
})
