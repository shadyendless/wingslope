import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { h, ref } from 'vue'
import GsOption from '../options/GsOption.vue'
import GsOptions from '../options/GsOptions.vue'
import GsComboBoxField from './GsComboBoxField.vue'
import GsSelectField from './GsSelectField.vue'

const affiliations = () => [
  h(GsOption, { value: 'friend', label: 'Friend' }),
  h(GsOption, { value: 'neutral', label: 'Neutral' }),
  h(GsOption, { value: 'hostile', label: 'Hostile', color: 'critical' }),
]

function renderWithModel(component: object, initial: unknown, props: Record<string, unknown> = {}) {
  const model = ref(initial)
  render(() =>
    h(
      component,
      {
        ...props,
        modelValue: model.value,
        'onUpdate:modelValue': (v: unknown) => (model.value = v),
      },
      { default: affiliations },
    ),
  )
  return model
}

describe('GsOptions', () => {
  it('renders a listbox and selects on click', async () => {
    const model = renderWithModel(GsOptions, undefined, { 'aria-label': 'Affiliation' })
    const listbox = screen.getByRole('listbox', { name: 'Affiliation' })
    expect(within(listbox).getAllByRole('option')).toHaveLength(3)

    await userEvent.click(screen.getByRole('option', { name: 'Hostile' }))
    expect(model.value).toBe('hostile')
    expect(screen.getByRole('option', { name: 'Hostile' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: 'Hostile' })).toHaveAttribute(
      'data-color',
      'critical',
    )
  })
})

describe('GsSelectField', () => {
  it('opens on click, selects an option and shows its label', async () => {
    const model = renderWithModel(GsSelectField, undefined, {
      label: 'Affiliation',
      placeholder: 'Choose one',
    })
    // Reka links the label after mount.
    const trigger = await screen.findByRole('combobox', { name: /Affiliation/ })
    expect(trigger).toHaveTextContent('Choose one')

    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole('option', { name: 'Neutral' }))

    expect(model.value).toBe('neutral')
    await waitFor(() => expect(trigger).toHaveTextContent('Neutral'))
  })

  it('marks the trigger invalid with an error message', async () => {
    renderWithModel(GsSelectField, undefined, { label: 'Affiliation', errorMessage: 'Required' })
    expect(screen.getByText('Required')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true'),
    )
  })
})

describe('GsComboBoxField', () => {
  it('filters options as you type and highlights the match', async () => {
    renderWithModel(GsComboBoxField, undefined, { label: 'Affiliation' })
    const input = await screen.findByRole('combobox', { name: /Affiliation/ })

    await userEvent.type(input, 'tra')

    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
    const option = screen.getByRole('option', { name: 'Neutral' })
    expect(option.querySelector('mark')).toHaveTextContent('tra')
  })

  it('selects an option and shows its label in the input', async () => {
    const model = renderWithModel(GsComboBoxField, undefined, { label: 'Affiliation' })
    const input = screen.getByRole('combobox')

    await userEvent.click(input)
    await userEvent.click(await screen.findByRole('option', { name: 'Hostile' }))

    expect(model.value).toBe('hostile')
    await waitFor(() => expect(input).toHaveValue('Hostile'))
  })

  it('shows the label of an initially selected value', async () => {
    renderWithModel(GsComboBoxField, 'friend', { label: 'Affiliation' })
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('Friend'))
  })
})
