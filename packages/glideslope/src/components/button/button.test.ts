import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import { provideButtonDefaults } from './defaults'
import GsButton from './GsButton.vue'
import GsLinkButton from './GsLinkButton.vue'
import GsToggleButton from './GsToggleButton.vue'

describe('GsButton', () => {
  it('renders a native button that never submits by accident', () => {
    render(GsButton, { slots: { default: () => 'Save' } })
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('applies default style props as data attributes and variant class', () => {
    render(GsButton, { slots: { default: () => 'Save' } })
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-color', 'mono-muted')
    expect(button).toHaveAttribute('data-size', 'medium')
    expect(button).toHaveClass('button', 'filled', 'group/button')
  })

  it('passes click listeners through', async () => {
    const onClick = vi.fn()
    render(GsButton, { attrs: { onClick }, slots: { default: () => 'Go' } })
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire clicks while disabled', async () => {
    const onClick = vi.fn()
    render(GsButton, {
      props: { disabled: true },
      attrs: { onClick },
      slots: { default: () => 'Go' },
    })
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('data-disabled')
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders its child with button styling when asChild is set', () => {
    render(GsButton, {
      props: { asChild: true, variant: 'outline' },
      slots: { default: () => h('a', { href: '/home' }, 'Home') },
    })
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toHaveClass('button', 'outline')
    expect(link).not.toHaveAttribute('type')
  })

  it('marks non-button elements as disabled with ARIA', () => {
    render(GsButton, { props: { as: 'div', disabled: true }, slots: { default: () => 'Go' } })
    expect(screen.getByText('Go')).toHaveAttribute('aria-disabled', 'true')
  })

  it('sizes icons in its slot', () => {
    render(GsButton, {
      props: { size: 'small' },
      slots: { default: () => h(GsIcon, null, () => 'i') },
    })
    expect(screen.getByText('i')).toHaveAttribute('data-size', 'small')
  })

  it('uses provided defaults, with explicit props taking precedence', () => {
    const Parent = defineComponent({
      setup() {
        provideButtonDefaults({ size: 'small', color: 'accent' })
        return () => [
          h(GsButton, null, () => 'Inherits'),
          h(GsButton, { color: 'critical' }, () => 'Overrides'),
        ]
      },
    })
    render(Parent)
    const inherits = screen.getByRole('button', { name: 'Inherits' })
    const overrides = screen.getByRole('button', { name: 'Overrides' })
    expect(inherits).toHaveAttribute('data-size', 'small')
    expect(inherits).toHaveAttribute('data-color', 'accent')
    expect(overrides).toHaveAttribute('data-size', 'small')
    expect(overrides).toHaveAttribute('data-color', 'critical')
  })
})

describe('GsLinkButton', () => {
  it('renders a link with button styling', () => {
    render(GsLinkButton, { props: { href: '/reports' }, slots: { default: () => 'Reports' } })
    const link = screen.getByRole('link', { name: 'Reports' })
    expect(link).toHaveAttribute('href', '/reports')
    expect(link).toHaveClass('button', 'filled')
  })

  it('removes the href and swallows clicks while disabled', async () => {
    const onClick = vi.fn()
    render(GsLinkButton, {
      props: { href: '/reports', disabled: true },
      attrs: { onClick },
      slots: { default: () => 'Reports' },
    })
    const link = screen.getByText('Reports')
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
    await userEvent.click(link)
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('GsToggleButton', () => {
  it('defaults to the flat variant', () => {
    render(GsToggleButton, { slots: { default: () => 'Bold' } })
    expect(screen.getByRole('button')).toHaveClass('button', 'toggle', 'flat')
  })

  it('toggles a v-model binding and exposes the pressed state', async () => {
    const pressed = ref(false)
    render(() =>
      h(
        GsToggleButton,
        { modelValue: pressed.value, 'onUpdate:modelValue': (v: boolean) => (pressed.value = v) },
        { default: ({ pressed: p }: { pressed: boolean }) => (p ? 'On' : 'Off') },
      ),
    )
    const button = screen.getByRole('button', { name: 'Off' })
    expect(button).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(button)
    expect(pressed.value).toBe(true)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button).toHaveAttribute('data-state', 'on')
    expect(button).toHaveTextContent('On')
  })

  it('keeps its own state without v-model', async () => {
    render(GsToggleButton, { slots: { default: () => 'Bold' } })
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not toggle while disabled', async () => {
    render(GsToggleButton, { props: { disabled: true }, slots: { default: () => 'Bold' } })
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })
})
