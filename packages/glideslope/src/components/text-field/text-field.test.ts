import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h, type Component } from 'vue'
import GsSearchField from './GsSearchField.vue'
import GsTextAreaField from './GsTextAreaField.vue'
import GsTextField from './GsTextField.vue'
import {
  provideSearchFieldDefaults,
  provideTextAreaFieldDefaults,
  provideTextFieldDefaults,
} from './defaults'

/** Renders `component` below a parent that calls `provide`. */
function renderWithDefaults(provide: () => void, component: Component, props = {}) {
  return render(
    defineComponent({
      setup() {
        provide()
        return () => h(component, props)
      },
    }),
  )
}

describe('GsTextField', () => {
  it('adds classes to the label, description and input parts', () => {
    render(GsTextField, {
      props: {
        label: 'Callsign',
        description: 'As filed',
        classes: {
          label: 'my-label',
          description: 'my-description',
          input: { container: 'my-container', sizer: 'my-sizer', input: 'my-input' },
        },
      },
      attrs: { class: 'my-field' },
    })
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('input', 'my-input')
    expect(input.parentElement).toHaveClass('sizer', 'my-sizer')
    expect(input.closest('.my-container')).toHaveClass('container')
    expect(input.closest('.my-field')).toHaveClass('field')
    expect(screen.getByText('Callsign (optional)')).toHaveClass('my-label')
    expect(screen.getByText('As filed')).toHaveClass('description', 'my-description')
  })

  it('adds a class to the error message', () => {
    render(GsTextField, {
      props: {
        label: 'Callsign',
        errorMessage: 'Unknown callsign',
        classes: { error: 'my-error' },
      },
    })
    expect(screen.getByText('Unknown callsign')).toHaveClass('error', 'my-error')
  })

  it('puts minLength and maxLength on the input', () => {
    render(GsTextField, { props: { label: 'Code', minLength: 2, maxLength: 4 } })
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('minlength', '2')
    expect(input).toHaveAttribute('maxlength', '4')
  })

  it('takes provided defaults, which its own props override', () => {
    renderWithDefaults(
      () =>
        provideTextFieldDefaults({
          size: 'small',
          disabled: true,
          required: true,
          clearable: false,
          classes: { input: { input: 'provided' } },
        }),
      GsTextField,
      { label: 'Callsign' },
    )
    // Small fields drop the visible label and name the input with it instead.
    const input = screen.getByRole('textbox', { name: 'Callsign' })
    expect(screen.queryByText(/Callsign/)).toBeNull()
    expect(input).toBeDisabled()
    expect(input).toBeRequired()
    expect(input).toHaveClass('provided')
    expect(screen.queryByRole('button', { name: 'Clear', hidden: true })).toBeNull()
  })

  it('prefers its own props over provided defaults', () => {
    renderWithDefaults(
      () => provideTextFieldDefaults({ size: 'small', disabled: true, readonly: true }),
      GsTextField,
      { label: 'Callsign', size: 'medium', disabled: false, readonly: false },
    )
    const input = screen.getByRole('textbox', { name: /Callsign/ })
    expect(screen.getByText('Callsign (optional)')).toBeInTheDocument()
    expect(input).toBeEnabled()
    expect(input).not.toHaveAttribute('readonly')
  })
})

describe('GsTextAreaField', () => {
  it('adds classes to its parts', () => {
    render(GsTextAreaField, {
      props: {
        label: 'Notes',
        description: 'Free text',
        classes: { label: 'my-label', input: 'my-input', description: 'my-description' },
      },
    })
    expect(screen.getByRole('textbox')).toHaveClass('input', 'my-input')
    expect(screen.getByText('Notes (optional)')).toHaveClass('my-label')
    expect(screen.getByText('Free text')).toHaveClass('my-description')
  })

  it('puts minLength and maxLength on the textarea', () => {
    render(GsTextAreaField, { props: { label: 'Notes', minLength: 10, maxLength: 500 } })
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('minlength', '10')
    expect(textarea).toHaveAttribute('maxlength', '500')
  })

  it('takes provided defaults', () => {
    renderWithDefaults(
      () => provideTextAreaFieldDefaults({ disabled: true, required: true, readonly: true }),
      GsTextAreaField,
      { label: 'Notes' },
    )
    const textarea = screen.getByRole('textbox', { name: 'Notes' })
    expect(textarea).toBeDisabled()
    expect(textarea).toBeRequired()
    expect(textarea).toHaveAttribute('readonly')
  })
})

describe('GsSearchField', () => {
  it('adds classes to its parts', async () => {
    const view = render(GsSearchField, {
      props: { classes: { input: 'my-input', clear: 'my-clear', loading: 'my-loading' } },
      attrs: { 'aria-label': 'Search' },
    })
    expect(screen.getByRole('searchbox')).toHaveClass('input', 'my-input')
    expect(screen.getByRole('button', { name: 'Clear search' })).toHaveClass('clear', 'my-clear')

    await view.rerender({ loading: true, classes: { loading: 'my-loading', search: 'my-search' } })
    expect(screen.getByRole('status', { name: 'Loading' })).toHaveClass('loading', 'my-loading')
    expect(document.querySelector('.search')).toHaveClass('my-search')
  })

  it('takes provided defaults, which its own props override', async () => {
    renderWithDefaults(
      () => provideSearchFieldDefaults({ variant: 'filled', disabled: true }),
      defineComponent(() => () => [
        h(GsSearchField, { 'aria-label': 'Provided' }),
        h(GsSearchField, { 'aria-label': 'Own', variant: 'outline', disabled: false }),
      ]),
    )
    const provided = screen.getByRole('searchbox', { name: 'Provided' })
    expect(provided).toBeDisabled()
    expect(provided.parentElement).toHaveClass('filled')

    const own = screen.getByRole('searchbox', { name: 'Own' })
    expect(own).toBeEnabled()
    expect(own.parentElement).toHaveClass('outline')
    await userEvent.type(own, 'raven')
    expect(own).toHaveValue('raven')
  })
})
