import { fireEvent, render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsList from './GsList.vue'
import GsListItem from './GsListItem.vue'

afterEach(() => {
  window.location.hash = ''
})

describe('GsListItem links', () => {
  function renderLinks(listProps: Record<string, unknown> = {}, onAction = vi.fn()) {
    render(GsList, {
      props: listProps,
      attrs: { 'aria-label': 'Missions' },
      slots: {
        default: () => [
          h(GsListItem, { value: 'a', label: 'Northern watch', href: '#/missions/a', onAction }),
          h(GsListItem, { value: 'b', label: 'Plain row', onAction }),
          h(GsListItem, { value: 'c', label: 'Closed', href: '#/missions/c', disabled: true }),
        ],
      },
    })
    return onAction
  }

  it('renders the row text as a link out of the tab order, inside a named row', () => {
    renderLinks()
    const row = screen.getByRole('row', { name: 'Northern watch' })
    const link = within(row).getByRole('link', { name: 'Northern watch' })
    expect(link).toHaveAttribute('href', '#/missions/a')
    expect(link).toHaveAttribute('tabindex', '-1')
    expect(link).toHaveClass('link')
    expect(within(screen.getByRole('row', { name: 'Plain row' })).queryByRole('link')).toBeNull()
  })

  it('opens the link and emits action once on click', async () => {
    const onAction = renderLinks()
    await userEvent.click(screen.getByRole('link', { name: 'Northern watch' }))
    expect(window.location.hash).toBe('#/missions/a')
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('opens the link and emits action once on Enter, keeping modifier keys', async () => {
    const onAction = renderLinks()
    const link = screen.getByRole('link', { name: 'Northern watch' })
    const clicks: MouseEvent[] = []
    link.addEventListener('click', (event) => clicks.push(event))

    screen.getByRole('row', { name: 'Northern watch' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(window.location.hash).toBe('#/missions/a')
    expect(onAction).toHaveBeenCalledTimes(1)

    link.addEventListener('click', (event) => event.preventDefault())
    await userEvent.keyboard('{Control>}{Enter}{/Control}')
    expect(clicks).toHaveLength(2)
    expect(clicks[1]!.ctrlKey).toBe(true)
  })

  it('keeps focus on the row when the link is pressed', async () => {
    renderLinks()
    const link = screen.getByRole('link', { name: 'Northern watch' })
    link.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(link)
    expect(screen.getByRole('row', { name: 'Northern watch' })).toHaveFocus()
  })

  it('is not a link while disabled', () => {
    renderLinks()
    expect(within(screen.getByRole('row', { name: 'Closed' })).queryByRole('link')).toBeNull()
  })

  it('ignores href in a selectable list, where the row selects', async () => {
    const selected = ref<unknown[]>([])
    render(() =>
      h(
        GsList,
        {
          'aria-label': 'Missions',
          selectionMode: 'multiple',
          modelValue: selected.value,
          'onUpdate:modelValue': (v: unknown) => (selected.value = v as unknown[]),
        },
        () => h(GsListItem, { value: 'a', label: 'Northern watch', href: '#/missions/a' }),
      ),
    )
    expect(screen.queryByRole('link')).toBeNull()
    await userEvent.click(screen.getByRole('row', { name: 'Northern watch' }))
    expect(selected.value).toEqual(['a'])
    expect(window.location.hash).toBe('')
  })

  it('emits no action in a disabled list', async () => {
    const onAction = renderLinks({ disabled: true })
    expect(screen.queryByRole('link')).toBeNull()
    await fireEvent.click(screen.getByRole('row', { name: 'Plain row' }))
    expect(onAction).not.toHaveBeenCalled()
  })
})

describe('GsListItem classes', () => {
  it('styles the icons in the row content, not those inside buttons', () => {
    render(GsList, {
      props: { variant: 'compact' },
      attrs: { 'aria-label': 'Tracks' },
      slots: {
        default: () =>
          h(
            GsListItem,
            { value: 'a', textValue: 'RAVEN 21', classes: { icon: 'custom-icon' } },
            {
              default: () => [h(GsIcon, { 'data-testid': 'prefix' }, () => '★'), 'RAVEN 21'],
              actions: () =>
                h(GsButton, { 'aria-label': 'Edit' }, () =>
                  h(GsIcon, { 'data-testid': 'button-icon' }, () => '✎'),
                ),
            },
          ),
      },
    })
    const prefix = screen.getByTestId('prefix')
    expect(prefix).toHaveClass('custom-icon')
    // The list still sizes the icon.
    expect(prefix).toHaveAttribute('data-size', 'small')
    expect(screen.getByTestId('button-icon')).not.toHaveClass('custom-icon')
  })
})
