import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { AcceptableValue } from 'reka-ui'
import { defineComponent, h, ref, type VNode } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsOption from '../options/GsOption.vue'
import GsOptionLabel from '../options/GsOptionLabel.vue'
import GsOptions from '../options/GsOptions.vue'
import GsOptionSection from '../options/GsOptionSection.vue'
import { provideComboBoxFieldDefaults, provideSelectFieldDefaults } from './defaults'
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

  it('exposes disabled options to assistive technology', () => {
    render(GsOptions, {
      attrs: { 'aria-label': 'Animals' },
      slots: { default: () => h(GsOption, { value: 'cat', label: 'Cat', disabled: true }) },
    })
    expect(screen.getByRole('option', { name: 'Cat' })).toHaveAttribute('aria-disabled', 'true')
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

/** Renders `render` inside a component that calls `provide` in its setup. */
function withProvider(provide: () => void, render: () => VNode) {
  return defineComponent({
    setup() {
      provide()
      return render
    },
  })
}

describe('GsOptions selection modes and classes', () => {
  it('emits action instead of selecting with selection-mode none', async () => {
    const model = ref<AcceptableValue | AcceptableValue[]>()
    const onFollow = vi.fn()
    const onDrop = vi.fn()
    render(() =>
      h(
        GsOptions,
        {
          'aria-label': 'Track actions',
          selectionMode: 'none',
          modelValue: model.value,
          'onUpdate:modelValue': (v?: AcceptableValue | AcceptableValue[]) => (model.value = v),
        },
        () => [
          h(GsOption, { value: 'follow', label: 'Follow', onAction: onFollow }),
          h(GsOption, { value: 'drop', label: 'Drop', disabled: true, onAction: onDrop }),
        ],
      ),
    )
    const follow = screen.getByRole('option', { name: 'Follow' })
    await userEvent.click(follow)
    await userEvent.click(screen.getByRole('option', { name: 'Drop' }))
    expect(onFollow).toHaveBeenCalledOnce()
    expect(onDrop).not.toHaveBeenCalled()
    expect(model.value).toBeUndefined()
    expect(follow).toHaveAttribute('aria-selected', 'false')

    screen.getByRole('listbox').focus()
    await userEvent.keyboard('{Enter}')
    expect(onFollow).toHaveBeenCalledTimes(2)
    expect(model.value).toBeUndefined()
  })

  it('selects several values with selection-mode multiple', async () => {
    const model = renderWithModel(GsOptions, [], {
      'aria-label': 'Affiliation',
      selectionMode: 'multiple',
    })
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
    await userEvent.click(screen.getByRole('option', { name: 'Friend' }))
    await userEvent.click(screen.getByRole('option', { name: 'Hostile' }))
    expect(model.value).toEqual(['friend', 'hostile'])
  })

  it('adds classes to the option icons and the section header', () => {
    render(GsOptions, {
      attrs: { 'aria-label': 'Birds' },
      slots: {
        default: () =>
          h(GsOptionSection, { header: 'Raptors', classes: { header: 'my-header' } }, () =>
            h(
              GsOption,
              { value: 'kestrel', textValue: 'Kestrel', classes: { icon: 'my-icon' } },
              () => [h(GsIcon, () => h('svg')), h(GsOptionLabel, () => 'Kestrel')],
            ),
          ),
      },
    })
    expect(screen.getByText('Raptors')).toHaveClass('header', 'my-header')
    const option = screen.getByRole('option', { name: 'Kestrel' })
    expect(option.querySelector('.my-icon')).toHaveClass('icon')
  })
})

describe('GsSelectField defaults and classes', () => {
  it('takes size and disabled from provideSelectFieldDefaults, below explicit props', async () => {
    render(
      withProvider(
        () => provideSelectFieldDefaults({ size: 'small', disabled: true }),
        () =>
          h('div', [
            h(GsSelectField, { label: 'Provided' }, { default: affiliations }),
            h(
              GsSelectField,
              { label: 'Explicit', size: 'medium', disabled: false },
              { default: affiliations },
            ),
          ]),
      ),
    )
    // At the small size the label isn't rendered and names the trigger instead.
    const provided = screen.getByRole('combobox', { name: 'Provided' })
    expect(provided).toBeDisabled()
    expect(screen.queryByText(/^Provided/)).not.toBeInTheDocument()
    const explicit = await screen.findByRole('combobox', { name: /Explicit/ })
    expect(explicit).toBeEnabled()
    expect(screen.getByText(/^Explicit/)).toBeInTheDocument()
  })

  it('adds classes to the inner parts', async () => {
    renderWithModel(GsSelectField, 'friend', {
      label: 'Affiliation',
      description: 'Pick one',
      classes: {
        label: 'my-label',
        trigger: 'my-trigger',
        value: 'my-value',
        popover: 'my-popover',
        description: 'my-description',
      },
    })
    const trigger = await screen.findByRole('combobox', { name: /Affiliation/ })
    expect(trigger).toHaveClass('trigger', 'my-trigger')
    expect(trigger.querySelector('.my-value')).toHaveClass('value')
    expect(screen.getByText(/^Affiliation/)).toHaveClass('my-label')
    expect(screen.getByText('Pick one')).toHaveClass('description', 'my-description')

    await userEvent.click(trigger)
    expect(await screen.findByRole('listbox')).toHaveClass('popover', 'my-popover')
  })

  it('adds the error class', () => {
    renderWithModel(GsSelectField, undefined, {
      label: 'Affiliation',
      errorMessage: 'Required',
      classes: { error: 'my-error' },
    })
    expect(screen.getByText('Required')).toHaveClass('error', 'my-error')
  })
})

const animals = () => [
  h(GsOption, { value: 1, label: 'Red Panda' }),
  h(GsOption, { value: 3, label: 'Dog' }),
  h(GsOption, { value: 4, label: 'Aardvark' }),
]

function renderComboBox(initial: AcceptableValue | undefined, props: Record<string, unknown> = {}) {
  const model = ref(initial)
  const search = ref('')
  const onUpdate = vi.fn((v: AcceptableValue | undefined) => (model.value = v))
  render(() =>
    h(
      GsComboBoxField,
      {
        label: 'Animal',
        ...props,
        modelValue: model.value,
        'onUpdate:modelValue': onUpdate,
        search: search.value,
        'onUpdate:search': (v: string) => (search.value = v),
      },
      { default: animals },
    ),
  )
  return { model, search, onUpdate, input: screen.getByRole<HTMLInputElement>('combobox') }
}

describe('GsComboBoxField custom values', () => {
  it('resets typed text that is not an option by default', async () => {
    const { model, input } = renderComboBox(undefined)
    await userEvent.type(input, 'Zebra')
    await userEvent.tab()
    await waitFor(() => expect(input).toHaveValue(''))
    expect(model.value).toBeUndefined()
  })

  it('keeps typed text as the value on blur with allow-custom-value', async () => {
    const { model, search, input } = renderComboBox(undefined, { allowCustomValue: true })
    await userEvent.type(input, 'Zebra')
    await userEvent.tab()
    expect(model.value).toBe('Zebra')
    // Reka UI resets the input after the list closes; it must keep the custom text.
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(input).toHaveValue('Zebra')
    expect(search.value).toBe('Zebra')
  })

  it('commits typed text on Enter when no option is highlighted', async () => {
    const { model, input } = renderComboBox(undefined, { allowCustomValue: true })
    await userEvent.type(input, 'Zebra{Enter}')
    expect(model.value).toBe('Zebra')
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'))
  })

  it('chooses the highlighted option on Enter', async () => {
    const { model, input } = renderComboBox(undefined, { allowCustomValue: true })
    await userEvent.type(input, 'Do{Enter}')
    expect(model.value).toBe(3)
    await waitFor(() => expect(input).toHaveValue('Dog'))
  })

  it('selects the option whose label was typed, ignoring case', async () => {
    const { model, input } = renderComboBox(undefined, { allowCustomValue: true })
    await userEvent.type(input, 'dog')
    await userEvent.tab()
    expect(model.value).toBe(3)
    await waitFor(() => expect(input).toHaveValue('Dog'))
  })

  it('still selects a clicked option without committing the typed text first', async () => {
    const { model, onUpdate, input } = renderComboBox(undefined, { allowCustomValue: true })
    await userEvent.type(input, 'Aa')
    await userEvent.click(await screen.findByRole('option', { name: 'Aardvark' }))
    expect(model.value).toBe(4)
    expect(onUpdate.mock.calls.map(([value]) => value)).toEqual([4])
    await waitFor(() => expect(input).toHaveValue('Aardvark'))
  })

  it('clears the value when the text is emptied', async () => {
    const { model, input } = renderComboBox(3, { allowCustomValue: true })
    await waitFor(() => expect(input).toHaveValue('Dog'))
    await userEvent.clear(input)
    await userEvent.tab()
    expect(model.value).toBeNull()
  })

  it('shows a free-text value when readonly', async () => {
    const text = 'test string long long long string'
    const { input } = renderComboBox(text, { allowCustomValue: true, readonly: true })
    await waitFor(() => expect(input).toHaveValue(text))
    expect(input).toHaveAttribute('title', text)
    expect(input).toHaveAttribute('readonly')
  })
})

describe('GsComboBoxField filtering, clearing, defaults and classes', () => {
  it('clears the text and the selection with the clear button', async () => {
    const { model, search, input } = renderComboBox(3)
    await waitFor(() => expect(input).toHaveValue('Dog'))
    await userEvent.click(input)
    await userEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(model.value).toBeNull()
    expect(search.value).toBe('')
    expect(input).toHaveValue('')
  })

  it('leaves filtering to the app with ignore-filter', async () => {
    const search = ref('')
    const items = ['Red Panda', 'Dog', 'Aardvark']
    render(() =>
      h(
        GsComboBoxField,
        {
          label: 'Animal',
          ignoreFilter: true,
          search: search.value,
          'onUpdate:search': (v: string) => (search.value = v),
        },
        () =>
          items
            .filter((item) => item.startsWith(search.value))
            .map((item) => h(GsOption, { key: item, value: item, label: item })),
      ),
    )
    const input = screen.getByRole('combobox')
    // "a" is in every name, but the app only keeps names that start with the text.
    await userEvent.type(input, 'A')
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
    expect(screen.getByRole('option', { name: 'Aardvark' })).toBeInTheDocument()
    await userEvent.clear(input)
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(3))
  })

  it('keeps showing the selected label when the app filters its option out', async () => {
    const search = ref('')
    const model = ref<AcceptableValue>()
    const items = [
      { id: 1, name: 'Red Panda' },
      { id: 3, name: 'Dog' },
    ]
    render(() =>
      h(
        GsComboBoxField,
        {
          label: 'Animal',
          ignoreFilter: true,
          modelValue: model.value,
          'onUpdate:modelValue': (v: AcceptableValue | undefined) => (model.value = v),
          search: search.value,
          'onUpdate:search': (v: string) => (search.value = v),
        },
        () =>
          items
            .filter((item) => item.name.includes(search.value))
            .map((item) => h(GsOption, { key: item.id, value: item.id, label: item.name })),
      ),
    )
    const input = screen.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.click(await screen.findByRole('option', { name: 'Dog' }))
    expect(model.value).toBe(3)
    await userEvent.clear(input)
    await userEvent.type(input, 'Red')
    await userEvent.tab()
    await waitFor(() => expect(input).toHaveValue('Dog'))
  })

  it('takes size and clearable from provideComboBoxFieldDefaults, below explicit props', () => {
    render(
      withProvider(
        () => provideComboBoxFieldDefaults({ size: 'small', clearable: false }),
        () =>
          h('div', [
            h(GsComboBoxField, { label: 'Provided' }, { default: animals }),
            h(GsComboBoxField, { label: 'Explicit', clearable: true }, { default: animals }),
          ]),
      ),
    )
    const provided = screen.getByRole('combobox', { name: 'Provided' })
    expect(provided.closest('[data-size]')).toHaveAttribute('data-size', 'small')
    expect(screen.getAllByRole('button', { name: /clear/i })).toHaveLength(1)
  })

  it('adds classes to the inner parts', async () => {
    renderComboBox(undefined, {
      description: 'Pick one',
      classes: {
        label: 'my-label',
        control: 'my-control',
        input: 'my-input',
        clear: 'my-clear',
        trigger: 'my-trigger',
        popover: 'my-popover',
        description: 'my-description',
      },
    })
    const input = screen.getByRole('combobox')
    expect(input).toHaveClass('input', 'my-input')
    expect(input.parentElement).toHaveClass('control', 'my-control')
    expect(screen.getByRole('button', { name: 'Show options' })).toHaveClass(
      'trigger',
      'my-trigger',
    )
    expect(screen.getByRole('button', { name: /clear/i })).toHaveClass('clear', 'my-clear')
    expect(screen.getByText(/^Animal/)).toHaveClass('my-label')
    expect(screen.getByText('Pick one')).toHaveClass('my-description')

    await userEvent.click(input)
    expect(await screen.findByRole('listbox')).toHaveClass('popover', 'my-popover')
  })
})
