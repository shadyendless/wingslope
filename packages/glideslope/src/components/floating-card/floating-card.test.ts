import { render, screen, within } from '@testing-library/vue'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, provide, inject, ref, type Component } from 'vue'
import { DRAG_THRESHOLD } from './constants'
import { useFloatingCard } from './context'
import GsFloatingCard from './GsFloatingCard.vue'
import GsFloatingCardProvider from './GsFloatingCardProvider.vue'
import type { GsFloatingCardProps, GsFloatingCardProviderProps } from './types'

/** Lets Vue finish the register → render panel → teleport round trip. */
async function settle() {
  for (let i = 0; i < 3; i++) await nextTick()
}

type CardSpec = Partial<GsFloatingCardProps> & { id: string; body?: string; open?: boolean }

async function renderCards(
  providerProps: GsFloatingCardProviderProps & {
    iconSlot?: (props: { id: string }) => unknown
  } = {},
  cards: CardSpec[] = [{ id: 'card-a', title: 'Details' }],
) {
  const { iconSlot, ...props } = providerProps
  const result = render(() =>
    h(GsFloatingCardProvider, props, {
      default: () =>
        cards.map(({ body, ...card }) =>
          h(GsFloatingCard, { key: card.id, ...card }, () => h('p', body ?? `Body of ${card.id}`)),
        ),
      ...(iconSlot ? { icon: iconSlot } : {}),
    }),
  )
  await settle()
  return { ...result, user: userEvent.setup() }
}

/** The card's geometry and stacking, from the CSS variables its panel sets. */
function geometry(card: HTMLElement) {
  const read = (name: string) => card.style.getPropertyValue(`--floating-card-${name}`)
  return {
    left: read('x'),
    top: read('y'),
    width: read('width'),
    height: read('height'),
    zIndex: Number(read('z-index')),
  }
}

describe('GsFloatingCard', () => {
  it('renders its content inside a non-modal dialog named by the title', async () => {
    await renderCards()
    const card = screen.getByRole('dialog', { name: 'Details' })
    expect(card).toHaveAttribute('aria-modal', 'false')
    expect(within(card).getByText('Body of card-a')).toBeInTheDocument()
    expect(within(card).getByText('Details')).toBeInTheDocument()
  })

  it('uses a generic accessible name when no title is given', async () => {
    await renderCards({}, [{ id: 'card-a' }])
    expect(screen.getByRole('dialog', { name: 'Floating card' })).toBeInTheDocument()
  })

  it('updates the accessible name when the title changes', async () => {
    const title = ref('Before')
    render(() =>
      h(GsFloatingCardProvider, null, () =>
        h(GsFloatingCard, { id: 'card-a', title: title.value }, () => 'Body'),
      ),
    )
    await settle()
    expect(screen.getByRole('dialog', { name: 'Before' })).toBeInTheDocument()
    title.value = 'After'
    await settle()
    expect(screen.getByRole('dialog', { name: 'After' })).toBeInTheDocument()
  })

  it('renders nothing when open is false', async () => {
    await renderCards({}, [{ id: 'card-a', title: 'Details', open: false }])
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Body of card-a')).not.toBeInTheDocument()
  })

  it('renders each open card exactly once', async () => {
    await renderCards({}, [
      { id: 'a', title: 'First' },
      { id: 'b', title: 'Second' },
    ])
    expect(screen.getAllByRole('dialog')).toHaveLength(2)
    expect(screen.getAllByText('Body of a')).toHaveLength(1)
  })

  it('applies initialDimensions and initialPosition', async () => {
    await renderCards({}, [
      {
        id: 'card-a',
        title: 'Details',
        initialDimensions: { width: 250, height: 200 },
        initialPosition: { x: 24, y: 48 },
      },
    ])
    expect(geometry(screen.getByRole('dialog'))).toMatchObject({
      left: '24px',
      top: '48px',
      width: '250px',
      height: '200px',
    })
  })

  it('falls back to the default geometry', async () => {
    await renderCards()
    expect(geometry(screen.getByRole('dialog'))).toMatchObject({
      left: '100px',
      top: '100px',
      width: '300px',
      height: '400px',
    })
  })

  it('removes the card when it unmounts', async () => {
    const shown = ref(true)
    render(() =>
      h(GsFloatingCardProvider, null, () =>
        shown.value ? h(GsFloatingCard, { id: 'card-a', title: 'Details' }, () => 'Body') : null,
      ),
    )
    await settle()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    shown.value = false
    await settle()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps the context of where its content is written', async () => {
    const key = Symbol('test')
    const Reader = defineComponent({ setup: () => () => h('p', inject(key, 'missing')) })
    const Host = defineComponent({
      setup() {
        provide(key, 'from the page')
        return () => h(GsFloatingCard, { id: 'card-a', title: 'Details' }, () => h(Reader))
      },
    })
    render(() => h(GsFloatingCardProvider, null, () => h(Host)))
    await settle()
    expect(within(screen.getByRole('dialog')).getByText('from the page')).toBeInTheDocument()
  })

  it('throws outside a provider', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => render(GsFloatingCard, { props: { id: 'card-a' } })).toThrow(
      'GsFloatingCard must be rendered within a GsFloatingCardProvider.',
    )
  })
})

describe('GsFloatingCard v-model:open', () => {
  function renderControlled() {
    const open = ref(true)
    render(() =>
      h(GsFloatingCardProvider, null, () =>
        h(
          GsFloatingCard,
          {
            id: 'card-a',
            title: 'Controllable',
            open: open.value,
            'onUpdate:open': (value: boolean) => (open.value = value),
            initialPosition: { x: 10, y: 10 },
          },
          () => 'Body',
        ),
      ),
    )
    return open
  }

  it('closes and reopens the card as open changes, from its initial geometry', async () => {
    const open = renderControlled()
    await settle()
    expect(screen.getByRole('dialog', { name: 'Controllable' })).toBeInTheDocument()

    open.value = false
    await settle()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    open.value = true
    await settle()
    expect(geometry(screen.getByRole('dialog'))).toMatchObject({ left: '10px', top: '10px' })
  })

  it('sets open to false when the close button closes the card', async () => {
    const open = renderControlled()
    await settle()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await settle()
    expect(open.value).toBe(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes an uncontrolled card with the close button', async () => {
    const { user } = await renderCards()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await settle()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('GsFloatingCardProvider header', () => {
  const Settings: Component = () => h('svg', { 'data-testid': 'settings-icon' })

  it('renders custom header actions before the close button and calls them', async () => {
    const onClick = vi.fn()
    const { user } = await renderCards({
      headerActions: [{ icon: Settings, label: 'Settings', onClick }],
    })
    const buttons = within(screen.getByRole('dialog')).getAllByRole('button')
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Settings',
      'Close',
    ])
    expect(within(buttons[0]!).getByTestId('settings-icon')).toBeInTheDocument()
    await user.click(buttons[0]!)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('resolves headerActions per card when given a function', async () => {
    await renderCards({ headerActions: (id) => (id === 'a' ? ['pin'] : []) }, [
      { id: 'a', title: 'Card A' },
      { id: 'b', title: 'Card B' },
    ])
    const a = screen.getByRole('dialog', { name: 'Card A' })
    const b = screen.getByRole('dialog', { name: 'Card B' })
    expect(within(a).getByRole('button', { name: 'Pin' })).toBeInTheDocument()
    expect(within(b).queryByRole('button', { name: 'Pin' })).not.toBeInTheDocument()
    expect(within(b).getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('renders a divider between action groups', async () => {
    await renderCards({
      headerActions: [{ icon: Settings, label: 'One', onClick: () => {} }, 'divider', 'pin'],
    })
    const separator = within(screen.getByRole('dialog')).getByRole('separator')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('renders the #icon slot per card, leaving it out when the slot renders nothing', async () => {
    const { container } = await renderCards(
      { iconSlot: ({ id }) => (id === 'a' ? h('svg', { 'data-testid': `icon-${id}` }) : null) },
      [
        { id: 'a', title: 'Card A' },
        { id: 'b', title: 'Card B' },
      ],
    )
    const a = screen.getByRole('dialog', { name: 'Card A' })
    expect(within(a).getByTestId('icon-a').parentElement).toHaveAttribute('data-size', 'small')
    expect(container.querySelectorAll('[data-testid^="icon-"]')).toHaveLength(1)
  })
})

describe('GsFloatingCard pinning', () => {
  it('toggles the pin button pressed state', async () => {
    const { user } = await renderCards({ headerActions: ['pin'] })
    const pin = screen.getByRole('button', { name: 'Pin' })
    expect(pin).toHaveAttribute('aria-pressed', 'false')
    await user.click(pin)
    expect(pin).toHaveAttribute('aria-pressed', 'true')
    expect(pin).toHaveAttribute('data-color', 'accent')
    expect(screen.getByRole('dialog')).toHaveAttribute('data-pinned')
    await user.click(pin)
    expect(pin).toHaveAttribute('aria-pressed', 'false')
  })

  it('starts pinned for ids in initialPinned', async () => {
    await renderCards({ headerActions: ['pin'], initialPinned: ['card-a'] })
    expect(screen.getByRole('button', { name: 'Pin' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('pins only the card whose button was pressed', async () => {
    const { user } = await renderCards({ headerActions: ['pin'] }, [
      { id: 'a', title: 'Card A' },
      { id: 'b', title: 'Card B' },
    ])
    const a = screen.getByRole('dialog', { name: 'Card A' })
    const b = screen.getByRole('dialog', { name: 'Card B' })
    await user.click(within(a).getByRole('button', { name: 'Pin' }))
    expect(within(a).getByRole('button', { name: 'Pin' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(b).getByRole('button', { name: 'Pin' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('releases the pin when a pinned card is closed', async () => {
    const open = ref(true)
    render(() =>
      h(GsFloatingCardProvider, { headerActions: ['pin'], initialPinned: ['card-a'] }, () =>
        h(
          GsFloatingCard,
          {
            id: 'card-a',
            title: 'Details',
            open: open.value,
            'onUpdate:open': (value: boolean) => (open.value = value),
          },
          () => 'Body',
        ),
      ),
    )
    await settle()
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    open.value = true
    await settle()
    expect(screen.getByRole('button', { name: 'Pin' })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('useFloatingCard', () => {
  it('throws outside a provider', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Consumer = defineComponent({
      setup() {
        useFloatingCard()
        return () => null
      },
    })
    expect(() => render(Consumer)).toThrow(
      'useFloatingCard must be used within a GsFloatingCardProvider.',
    )
  })

  function renderWithControls() {
    const open = ref(true)
    const Controls = defineComponent({
      setup() {
        const { closeCard, togglePinCard, isPinned, cards } = useFloatingCard()
        return () => [
          h('button', { onClick: () => closeCard('card-a') }, 'close it'),
          h(
            'button',
            { onClick: () => togglePinCard('card-a') },
            isPinned('card-a') ? 'unpin it' : 'pin it',
          ),
          h('output', { 'data-testid': 'container' }, cards['card-a'] ? 'open' : 'closed'),
        ]
      },
    })
    render(() =>
      h(GsFloatingCardProvider, { headerActions: ['pin'] }, () => [
        h(Controls),
        h(
          GsFloatingCard,
          {
            id: 'card-a',
            title: 'Details',
            open: open.value,
            'onUpdate:open': (value: boolean) => (open.value = value),
          },
          () => h('p', 'Body'),
        ),
      ]),
    )
    return open
  }

  it('closes a card through closeCard, updating its v-model:open', async () => {
    const open = renderWithControls()
    await settle()
    await userEvent.click(screen.getByRole('button', { name: 'close it' }))
    await settle()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(open.value).toBe(false)
  })

  it('reports and toggles pin state reactively', async () => {
    renderWithControls()
    await settle()
    await userEvent.click(screen.getByRole('button', { name: 'pin it' }))
    expect(screen.getByRole('button', { name: 'Pin' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Pin' }))
    expect(screen.getByRole('button', { name: 'pin it' })).toBeInTheDocument()
  })

  it('exposes the content element of an open card', async () => {
    renderWithControls()
    await settle()
    expect(screen.getByTestId('container')).toHaveTextContent('open')
    expect(screen.getByText('Body').parentElement).toHaveClass('content')
  })
})

describe('several providers', () => {
  it('keeps each provider independent', async () => {
    render(() =>
      h('div', [
        h(GsFloatingCardProvider, { headerActions: ['pin'] }, () =>
          h(GsFloatingCard, { id: 'same', title: 'Left' }, () => 'Left body'),
        ),
        h(GsFloatingCardProvider, { headerActions: ['pin'] }, () =>
          h(GsFloatingCard, { id: 'same', title: 'Right' }, () => 'Right body'),
        ),
      ]),
    )
    await settle()
    const left = screen.getByRole('dialog', { name: 'Left' })
    const right = screen.getByRole('dialog', { name: 'Right' })
    await userEvent.click(within(left).getByRole('button', { name: 'Pin' }))
    expect(within(right).getByRole('button', { name: 'Pin' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await userEvent.click(within(left).getByRole('button', { name: 'Close' }))
    await settle()
    expect(screen.queryByRole('dialog', { name: 'Left' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Right' })).toBeInTheDocument()
  })
})

/** Provider size the cards are constrained to, inside jsdom's 1024×768 window. */
const CONTAINER = { width: 800, height: 700 }

describe('gestures', () => {
  beforeEach(() => {
    // jsdom gives every element an empty rect, which would clamp every gesture to the origin.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: CONTAINER.width,
      bottom: CONTAINER.height,
      width: CONTAINER.width,
      height: CONTAINER.height,
      toJSON: () => ({}),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /** Presses on a target, moves to a point and releases. Moves go to the body, as the gesture listens on the document. */
  function drag(
    user: UserEvent,
    target: Element,
    from: { x: number; y: number },
    to: { x: number; y: number },
  ) {
    return user.pointer([
      { keys: '[MouseLeft>]', target, coords: { clientX: from.x, clientY: from.y } },
      { target: document.body, coords: { clientX: to.x, clientY: to.y } },
      { keys: '[/MouseLeft]', target: document.body, coords: { clientX: to.x, clientY: to.y } },
    ])
  }

  async function renderCard(
    providerProps: GsFloatingCardProviderProps = {},
    cardProps: Partial<GsFloatingCardProps> = {},
  ) {
    const { user } = await renderCards(providerProps, [
      {
        id: 'card-a',
        title: 'Details',
        initialDimensions: { width: 300, height: 400 },
        initialPosition: { x: 100, y: 100 },
        ...cardProps,
      },
    ])
    const card = screen.getByRole('dialog', { name: 'Details' })
    return { card, header: card.firstElementChild as HTMLElement, user }
  }

  function handleFor(card: HTMLElement, direction: string) {
    const handle = card.querySelector(`[data-handle="${direction}"]`)
    if (!handle) throw new Error(`missing resize handle: ${direction}`)
    return handle
  }

  describe('dragging a card', () => {
    it('moves the card by the pointer delta', async () => {
      const { card, header, user } = await renderCard()
      await drag(user, header, { x: 150, y: 110 }, { x: 250, y: 210 })
      expect(geometry(card)).toMatchObject({ left: '200px', top: '200px' })
    })

    it('ignores movement below the drag threshold', async () => {
      const { card, header, user } = await renderCard()
      await drag(user, header, { x: 150, y: 110 }, { x: 150 + DRAG_THRESHOLD - 1, y: 110 })
      expect(geometry(card)).toMatchObject({ left: '100px', top: '100px' })
    })

    it('keeps the card inside the container', async () => {
      const { card, header, user } = await renderCard()
      await drag(user, header, { x: 150, y: 110 }, { x: 5000, y: 5000 })
      expect(geometry(card)).toMatchObject({
        left: `${CONTAINER.width - 300}px`,
        top: `${CONTAINER.height - 400}px`,
      })
    })

    it('does not move past the top-left corner', async () => {
      const { card, header, user } = await renderCard()
      await drag(user, header, { x: 150, y: 110 }, { x: -5000, y: -5000 })
      expect(geometry(card)).toMatchObject({ left: '0px', top: '0px' })
    })

    it('lets the card past the provider edge with bounds="viewport"', async () => {
      const { card, header, user } = await renderCard({ bounds: 'viewport' })
      await drag(user, header, { x: 150, y: 110 }, { x: 5000, y: 110 })
      expect(geometry(card).left).toBe(`${window.innerWidth - 300}px`)
      expect(window.innerWidth - 300).toBeGreaterThan(CONTAINER.width - 300)
    })

    it('rests a card larger than its container against the top-left', async () => {
      const { card, header, user } = await renderCard(
        {},
        { initialDimensions: { width: CONTAINER.width + 100, height: CONTAINER.height + 100 } },
      )
      await drag(user, header, { x: 150, y: 110 }, { x: 400, y: 400 })
      expect(geometry(card)).toMatchObject({ left: '0px', top: '0px' })
    })

    it('does not drag when the press starts on a header button', async () => {
      const { card, user } = await renderCard()
      await drag(
        user,
        screen.getByRole('button', { name: 'Close' }),
        { x: 150, y: 110 },
        { x: 300, y: 300 },
      )
      expect(geometry(card)).toMatchObject({ left: '100px', top: '100px' })
    })

    it('does not drag a pinned card', async () => {
      const { card, header, user } = await renderCard({
        headerActions: ['pin'],
        initialPinned: ['card-a'],
      })
      await drag(user, header, { x: 150, y: 110 }, { x: 300, y: 300 })
      expect(geometry(card)).toMatchObject({ left: '100px', top: '100px' })
    })

    it('ignores non-primary buttons', async () => {
      const { card, header, user } = await renderCard()
      await user.pointer([
        { keys: '[MouseRight>]', target: header, coords: { clientX: 150, clientY: 110 } },
        { target: document.body, coords: { clientX: 400, clientY: 400 } },
        { keys: '[/MouseRight]', target: document.body },
      ])
      expect(geometry(card)).toMatchObject({ left: '100px', top: '100px' })
    })
  })

  describe('resizing a card', () => {
    it('grows from the south-east corner without moving the origin', async () => {
      const { card, user } = await renderCard()
      await drag(user, handleFor(card, 'se'), { x: 400, y: 500 }, { x: 500, y: 600 })
      expect(geometry(card)).toMatchObject({
        width: '400px',
        height: '500px',
        left: '100px',
        top: '100px',
      })
    })

    it('moves the origin when resizing from the north-west corner', async () => {
      const { card, user } = await renderCard()
      await drag(user, handleFor(card, 'nw'), { x: 100, y: 100 }, { x: 150, y: 150 })
      expect(geometry(card)).toMatchObject({
        width: '250px',
        height: '350px',
        left: '150px',
        top: '150px',
      })
    })

    it('resizes width only from an east handle', async () => {
      const { card, user } = await renderCard()
      await drag(user, handleFor(card, 'e'), { x: 400, y: 300 }, { x: 450, y: 380 })
      expect(geometry(card)).toMatchObject({ width: '350px', height: '400px' })
    })

    it('resizes height only from a south handle', async () => {
      const { card, user } = await renderCard()
      await drag(user, handleFor(card, 's'), { x: 250, y: 500 }, { x: 330, y: 560 })
      expect(geometry(card)).toMatchObject({ width: '300px', height: '460px' })
    })

    it('stops at the minimum size', async () => {
      const { card, user } = await renderCard()
      await drag(user, handleFor(card, 'se'), { x: 400, y: 500 }, { x: 0, y: 0 })
      expect(geometry(card)).toMatchObject({ width: '150px', height: '100px' })
    })

    it('does not resize beyond the container', async () => {
      const { card, user } = await renderCard()
      await drag(user, handleFor(card, 'se'), { x: 400, y: 500 }, { x: 5000, y: 5000 })
      expect(geometry(card)).toMatchObject({
        width: `${CONTAINER.width - 100}px`,
        height: `${CONTAINER.height - 100}px`,
      })
    })

    it('does not shift a card that already starts left of the container', async () => {
      const { card, user } = await renderCard({}, { initialPosition: { x: -50, y: 100 } })
      await drag(user, handleFor(card, 'w'), { x: 0, y: 300 }, { x: 0, y: 300 })
      expect(geometry(card)).toMatchObject({ left: '-50px', width: '300px' })
    })

    it('does not shift a card that already starts above the container', async () => {
      const { card, user } = await renderCard({}, { initialPosition: { x: 100, y: -50 } })
      await drag(user, handleFor(card, 'n'), { x: 250, y: 0 }, { x: 250, y: 0 })
      expect(geometry(card)).toMatchObject({ top: '-50px', height: '400px' })
    })

    it('does not shrink a card that already extends past the right edge', async () => {
      const { card, user } = await renderCard(
        {},
        { initialPosition: { x: CONTAINER.width - 50, y: 100 } },
      )
      await drag(user, handleFor(card, 'e'), { x: 400, y: 300 }, { x: 400, y: 300 })
      expect(geometry(card)).toMatchObject({ width: '300px' })
    })

    it('does not shrink a card that already extends past the bottom edge', async () => {
      const { card, user } = await renderCard(
        {},
        { initialPosition: { x: 100, y: CONTAINER.height - 50 } },
      )
      await drag(user, handleFor(card, 's'), { x: 250, y: 500 }, { x: 250, y: 500 })
      expect(geometry(card)).toMatchObject({ height: '400px' })
    })

    it('renders hidden resize handles, and none while pinned', async () => {
      const { card, user } = await renderCard({ headerActions: ['pin'] })
      const handles = card.querySelectorAll('[data-handle]')
      expect(handles).toHaveLength(8)
      expect([...handles].every((handle) => handle.getAttribute('aria-hidden') === 'true')).toBe(
        true,
      )
      await user.click(screen.getByRole('button', { name: 'Pin' }))
      expect(card.querySelectorAll('[data-handle]')).toHaveLength(0)
    })
  })

  it('keeps a dragged position when the title changes', async () => {
    const title = ref('Before')
    render(() =>
      h(GsFloatingCardProvider, null, () =>
        h(
          GsFloatingCard,
          {
            id: 'card-a',
            title: title.value,
            initialDimensions: { width: 300, height: 400 },
            initialPosition: { x: 100, y: 100 },
          },
          () => 'Body',
        ),
      ),
    )
    await settle()
    const user = userEvent.setup()
    const card = screen.getByRole('dialog', { name: 'Before' })
    await drag(user, card.firstElementChild!, { x: 150, y: 110 }, { x: 250, y: 210 })
    title.value = 'After'
    await settle()
    expect(geometry(screen.getByRole('dialog', { name: 'After' }))).toMatchObject({
      left: '200px',
      top: '200px',
    })
  })

  describe('stacking order', () => {
    it('raises a card above its siblings when pressed', async () => {
      const { user } = await renderCards({}, [
        { id: 'first', title: 'First' },
        { id: 'second', title: 'Second' },
      ])
      const first = screen.getByRole('dialog', { name: 'First' })
      const second = screen.getByRole('dialog', { name: 'Second' })
      // The later card opens on top.
      expect(geometry(second).zIndex).toBeGreaterThan(geometry(first).zIndex)
      await user.pointer({ keys: '[MouseLeft]', target: first })
      expect(geometry(first).zIndex).toBeGreaterThan(geometry(second).zIndex)
    })

    it('raises a card when focus moves into it', async () => {
      await renderCards({}, [
        { id: 'first', title: 'First' },
        { id: 'second', title: 'Second' },
      ])
      const first = screen.getByRole('dialog', { name: 'First' })
      within(first).getByRole('button', { name: 'Close' }).focus()
      await nextTick()
      expect(geometry(first).zIndex).toBeGreaterThan(
        geometry(screen.getByRole('dialog', { name: 'Second' })).zIndex,
      )
    })

    it('keeps stacking values bounded as focus alternates', async () => {
      const { user } = await renderCards({}, [
        { id: 'first', title: 'First' },
        { id: 'second', title: 'Second' },
      ])
      const first = screen.getByRole('dialog', { name: 'First' })
      const second = screen.getByRole('dialog', { name: 'Second' })
      for (let round = 0; round < 10; round++) {
        await user.pointer({ keys: '[MouseLeft]', target: round % 2 === 0 ? first : second })
      }
      expect(geometry(first).zIndex).toBeLessThanOrEqual(2)
      expect(geometry(second).zIndex).toBeLessThanOrEqual(2)
    })
  })
})
