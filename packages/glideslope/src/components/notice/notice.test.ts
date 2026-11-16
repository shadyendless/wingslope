import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { effectScope, h } from 'vue'
import GsNoticeList from './GsNoticeList.vue'
import { useNotices } from './use-notices'

const { queue, dequeue, clear, notices, onAction, onClose } = useNotices()

afterEach(() => clear())

/** The notice (`role="status"` toast) showing a message. */
const noticeOf = (message: string) => screen.getByText(message).closest('li') as HTMLElement

describe('GsNoticeList queue', () => {
  it('shows the newest three notices first and brings older ones back as they close', async () => {
    render(GsNoticeList)
    for (const n of [1, 2, 3, 4]) queue({ message: `Notice ${n}` })
    await screen.findByText('Notice 4')
    const shown = screen.getAllByText(/^Notice \d$/).map((el) => el.textContent)
    expect(shown).toEqual(['Notice 4', 'Notice 3', 'Notice 2'])

    await userEvent.click(within(noticeOf('Notice 4')).getByRole('button', { name: 'Dismiss' }))
    expect(await screen.findByText('Notice 1')).toBeInTheDocument()
  })

  it('routes notices by target: lists without an id show untargeted ones only', async () => {
    render(() => [h(GsNoticeList), h(GsNoticeList, { id: 'panel', label: 'Panel' })])
    queue({ message: 'Untargeted' })
    queue({ message: 'For the panel', target: 'panel' })
    queue({ message: 'For nobody', target: 'elsewhere' })
    const panel = screen.getByRole('region', { name: 'Panel (F8)' })
    const main = screen.getByRole('region', { name: 'Notifications (F8)' })
    expect(await within(main).findByText('Untargeted')).toBeInTheDocument()
    expect(within(main).queryByText('For the panel')).toBeNull()
    expect(within(panel).getByText('For the panel')).toBeInTheDocument()
    expect(within(panel).queryByText('Untargeted')).toBeNull()
    expect(screen.queryByText('For nobody')).toBeNull()
  })

  it('renders in place without a placement, and pinned with one', () => {
    const { container } = render(() => [
      h(GsNoticeList, { 'data-testid': 'inline', class: 'mine' }),
      h(GsNoticeList, { id: 'pinned', placement: 'bottom left', 'data-testid': 'pinned' }),
    ])
    const inline = screen.getByTestId('inline')
    expect(inline).toHaveClass('region', 'mine')
    expect(inline).not.toHaveAttribute('data-placement')
    expect(inline.parentElement).toBe(container)
    expect(screen.getByTestId('pinned')).toHaveAttribute('data-placement', 'bottom left')
  })

  it('renders at the end of body when global', () => {
    const { container } = render(GsNoticeList, {
      props: { global: true, placement: 'top right' },
      attrs: { 'data-testid': 'region' },
    })
    const region = screen.getByTestId('region')
    expect(region.parentElement).toBe(document.body)
    expect(container.contains(region)).toBe(false)
    expect(region).toHaveAttribute('data-global')
  })

  it('applies classes to the list, the clear-all button and each notice', async () => {
    render(GsNoticeList, {
      props: {
        classes: {
          list: 'my-list',
          button: 'my-button',
          notice: { notice: 'my-notice', content: 'my-content', message: 'my-message' },
        },
      },
    })
    queue({ message: 'One', primary: { label: 'Go' } })
    queue({ message: 'Two' })
    await screen.findByText('Two')
    expect(screen.getByRole('button', { name: 'Clear all' })).toHaveClass('my-button')
    expect(noticeOf('One')).toHaveClass('notice', 'my-notice')
    expect(noticeOf('One').parentElement).toHaveClass('list', 'my-list')
    expect(screen.getByText('One')).toHaveClass('message', 'my-message')
    expect(screen.getByText('One').parentElement).toHaveClass('content', 'my-content')
  })

  it('clears every notice of the list, shown or waiting, with Clear all', async () => {
    render(GsNoticeList, { props: { limit: 2 } })
    queue({ message: 'Other list', target: 'other' })
    for (const n of [1, 2, 3]) queue({ message: `Notice ${n}` })
    await userEvent.click(await screen.findByRole('button', { name: 'Clear all' }))
    expect(notices.value.map((notice) => notice.message)).toEqual(['Other list'])
  })
})

describe('per-notice options', () => {
  it('shows a close button unless a timed notice has both actions', async () => {
    render(GsNoticeList, { props: { defaultTimeout: 60_000 } })
    queue({ message: 'Plain' })
    queue({ message: 'Both', primary: { label: 'Yes' }, secondary: { label: 'No' } })
    queue({ message: 'Hidden', showClose: false })
    await screen.findByText('Hidden')
    expect(within(noticeOf('Plain')).getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
    expect(within(noticeOf('Both')).queryByRole('button', { name: 'Dismiss' })).toBeNull()
    expect(within(noticeOf('Hidden')).queryByRole('button', { name: 'Dismiss' })).toBeNull()
  })

  it('passes hideIcon through', async () => {
    render(GsNoticeList)
    queue({ message: 'With icon' })
    queue({ message: 'Without icon', hideIcon: true })
    await screen.findByText('Without icon')
    expect(noticeOf('With icon').querySelector('svg')).not.toBeNull()
    // Only the close button's icon is left.
    expect(noticeOf('Without icon').querySelectorAll('svg')).toHaveLength(1)
  })

  it('stays open after an action unless closeOnAction is set', async () => {
    const stay = vi.fn()
    render(GsNoticeList)
    queue({ message: 'Stays', primary: { label: 'Keep', onAction: stay } })
    queue({ message: 'Closes', primary: { label: 'Done' }, closeOnAction: true })
    await userEvent.click(await screen.findByRole('button', { name: 'Keep' }))
    expect(stay).toHaveBeenCalledOnce()
    expect(screen.getByText('Stays')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByText('Closes')).toBeNull())
    expect(notices.value.map((notice) => notice.message)).toEqual(['Stays'])
  })
})

describe('dequeue', () => {
  const messages = () => notices.value.map((notice) => notice.message)

  it('removes by id, given as a string or a filter', () => {
    queue({ id: 'a', message: 'A' })
    queue({ id: 'b', message: 'B' })
    queue({ id: 'c', message: 'C' })
    dequeue('a')
    dequeue({ id: 'b' })
    expect(messages()).toEqual(['C'])
  })

  it('removes by color from every list unless a target is given', () => {
    queue({ message: 'Serious A', color: 'serious', target: 'a' })
    queue({ message: 'Serious B', color: 'serious', target: 'b' })
    queue({ message: 'Info A', color: 'info', target: 'a' })
    dequeue({ color: 'serious', target: 'b' })
    expect(messages()).toEqual(['Serious A', 'Info A'])
    dequeue({ color: 'serious' })
    expect(messages()).toEqual(['Info A'])
  })

  it('matches notices without a color by the default color of the lists showing them', () => {
    render(() => [h(GsNoticeList, { id: 'alerts', defaultColor: 'critical' })])
    queue({ message: 'Alert', target: 'alerts' })
    queue({ message: 'Unlisted' })
    dequeue({ color: 'info' })
    expect(messages()).toEqual(['Alert'])
    dequeue({ color: 'critical' })
    expect(messages()).toEqual([])
  })

  it('matches each metadata key by deep equality', () => {
    queue({ message: 'Circle', metadata: { shape: 'circle', id: 1 } })
    queue({ message: 'Square', metadata: { shape: 'square' } })
    queue({ message: 'Both', metadata: { shapes: ['circle', 'square'] } })
    queue({ message: 'Nested', metadata: { shapes: { shape: 'square' } } })
    queue({ message: 'None' })

    dequeue({ metadata: { shape: 'circle' } })
    expect(messages()).toEqual(['Square', 'Both', 'Nested', 'None'])
    dequeue({ metadata: { shapes: ['circle'] } })
    expect(messages()).toEqual(['Square', 'Both', 'Nested', 'None'])
    dequeue({ metadata: { shapes: ['circle', 'square'] } })
    dequeue({ metadata: { shapes: { shape: 'square' } } })
    expect(messages()).toEqual(['Square', 'None'])
  })

  it('requires every criterion to match', () => {
    const square = { shape: 'square' }
    const circle = { shape: 'circle' }
    queue({ message: 'A serious square', target: 'a', color: 'serious', metadata: square })
    queue({ message: 'A serious circle', target: 'a', color: 'serious', metadata: circle })
    queue({ message: 'A info square', target: 'a', color: 'info', metadata: square })
    queue({ message: 'B serious square', target: 'b', color: 'serious', metadata: square })
    dequeue({ target: 'a', color: 'serious', metadata: { shape: 'square' } })
    expect(messages()).toEqual(['A serious circle', 'A info square', 'B serious square'])
  })

  it('removes everything with an empty filter', () => {
    queue({ message: 'One' })
    queue({ message: 'Two', target: 'panel' })
    dequeue({})
    expect(messages()).toEqual([])
  })
})

describe('notice events', () => {
  it('reports actions and closes with the notice id and metadata', async () => {
    const actions = vi.fn()
    const closes = vi.fn()
    const order: string[] = []
    const stopAction = onAction((event) => {
      actions(event)
      order.push('action')
    })
    const stopClose = onClose((event) => {
      closes(event)
      order.push('close')
    })
    render(GsNoticeList)
    const metadata = { layerId: 'roads' }
    queue({
      id: 'layer',
      message: 'Layer failed',
      primary: { label: 'Retry' },
      secondary: { label: 'Ignore' },
      closeOnAction: true,
      metadata,
    })
    await userEvent.click(await screen.findByRole('button', { name: 'Ignore' }))
    expect(actions).toHaveBeenCalledExactlyOnceWith({ id: 'layer', metadata, action: 'secondary' })
    expect(closes).toHaveBeenCalledExactlyOnceWith({ id: 'layer', metadata })
    expect(order).toEqual(['action', 'close'])
    expect(actions.mock.calls[0]?.[0].metadata).toBe(metadata)

    stopAction()
    stopClose()
    queue({ message: 'Again', primary: { label: 'Retry' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(actions).toHaveBeenCalledOnce()
    expect(closes).toHaveBeenCalledOnce()
  })

  it('reports closes from the close button and Clear all, not from dequeue', async () => {
    const closes = vi.fn()
    const stop = onClose(closes)
    render(GsNoticeList)
    queue({ id: 'one', message: 'One' })
    queue({ id: 'two', message: 'Two' })
    queue({ id: 'three', message: 'Three' })
    await userEvent.click(
      within(await screen.findByText('Three').then((el) => el.closest('li')!)).getByRole('button', {
        name: 'Dismiss',
      }),
    )
    expect(closes).toHaveBeenCalledExactlyOnceWith({ id: 'three', metadata: undefined })

    dequeue('two')
    expect(closes).toHaveBeenCalledOnce()

    queue({ id: 'four', message: 'Four' })
    await userEvent.click(await screen.findByRole('button', { name: 'Clear all' }))
    expect(closes.mock.calls.map(([event]) => event.id)).toEqual(['three', 'one', 'four'])
    stop()
  })

  it('stops listening when the scope that added the listener ends', async () => {
    const actions = vi.fn()
    const scope = effectScope()
    scope.run(() => onAction(actions))
    scope.stop()
    render(GsNoticeList)
    queue({ message: 'Scoped', primary: { label: 'Go' } })
    await userEvent.click(await screen.findByRole('button', { name: 'Go' }))
    expect(actions).not.toHaveBeenCalled()
  })
})
