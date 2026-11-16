import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { computed, h, nextTick, type VNodeChild } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsDrawer from './GsDrawer.vue'
import GsDrawerBack from './GsDrawerBack.vue'
import GsDrawerClose from './GsDrawerClose.vue'
import GsDrawerContent from './GsDrawerContent.vue'
import GsDrawerFooter from './GsDrawerFooter.vue'
import GsDrawerHeader from './GsDrawerHeader.vue'
import GsDrawerHeaderTitle from './GsDrawerHeaderTitle.vue'
import GsDrawerLayout from './GsDrawerLayout.vue'
import GsDrawerLayoutMain from './GsDrawerLayoutMain.vue'
import GsDrawerMenu from './GsDrawerMenu.vue'
import GsDrawerMenuItem from './GsDrawerMenuItem.vue'
import GsDrawerPanel from './GsDrawerPanel.vue'
import GsDrawerTrigger from './GsDrawerTrigger.vue'
import GsDrawerView from './GsDrawerView.vue'
import type { GsDrawerTarget } from './types'
import { useDrawers } from './use-drawers'

const ids = { drawer: 'drawer', a: 'view-a', b: 'view-b', c: 'view-c' }

const button = (label: string) => h(GsButton, null, () => label)
const trigger = (target: GsDrawerTarget | GsDrawerTarget[], label: string) =>
  h(GsDrawerTrigger, { for: target }, () => button(label))

const menu = (order: string[] = [ids.a, ids.b, ids.c], itemProps: Record<string, unknown> = {}) =>
  h(GsDrawerMenu, { 'aria-label': 'Views' }, () =>
    order.map((view) => {
      const letter = view.slice(-1).toUpperCase()
      return h(
        GsDrawerMenuItem,
        { for: view, textValue: `Menu ${letter}`, ...itemProps },
        () => letter,
      )
    }),
  )

/** Views inside a shared header, content and footer. */
const shared = () => [
  menu(),
  h(GsDrawerPanel, null, () => [
    h(GsDrawerHeader, null, () => [
      h(GsDrawerHeaderTitle, null, () => 'Title'),
      trigger('clear', 'Close'),
      h(GsDrawerClose, { 'aria-label': 'close-with', for: ids.a }),
    ]),
    h(GsDrawerContent, null, () => [
      h(GsDrawerView, { id: ids.a }, () => 'View A'),
      h(GsDrawerView, { id: ids.b }, () => 'View B'),
      h(GsDrawerView, { id: ids.c }, () => 'View C'),
    ]),
    h(GsDrawerFooter, null, () => 'Footer'),
  ]),
]

/** Views with a header, content and footer of their own. */
const alternate = () => [
  menu([ids.a, ids.c, ids.b]),
  h(GsDrawerPanel, null, () =>
    ['A', 'B', 'C'].map((letter) =>
      h(GsDrawerView, { id: `view-${letter.toLowerCase()}` }, () => [
        h(GsDrawerHeader, null, () => h(GsDrawerHeaderTitle, null, () => `Title ${letter}`)),
        h(GsDrawerContent, null, () => `Content ${letter}`),
        h(GsDrawerFooter, null, () => `Footer ${letter}`),
      ]),
    ),
  ),
]

function setup(
  props: Record<string, unknown> = {},
  children: () => VNodeChild = shared,
  outside: () => VNodeChild = () => [
    trigger(`open:${ids.a}`, 'Open A'),
    h(GsDrawerClose, { for: ids.a, 'aria-label': 'outside-close' }),
  ],
) {
  const result = render(() => [
    h(GsDrawer, { id: ids.drawer, 'data-testid': 'drawer', ...props }, children),
    outside(),
  ])
  return { ...result, drawer: screen.getByTestId('drawer') }
}

const shown = () => ['View A', 'View B', 'View C'].filter((text) => screen.queryByText(text))
const tab = (name: string) => screen.getByRole('tab', { name })
const click = (name: string) => userEvent.click(screen.getByRole('button', { name }))

describe('GsDrawer', () => {
  it('renders no content while closed', () => {
    const { drawer } = setup()
    expect(shown()).toEqual([])
    expect(drawer).toHaveAttribute('data-state', 'closed')
  })

  it('renders no content while closed: views with their own parts', () => {
    setup({}, alternate)
    for (const letter of ['A', 'B', 'C']) {
      expect(screen.queryByText(`Content ${letter}`)).toBeNull()
    }
  })

  it('renders the default view and selects its menu item', () => {
    const { drawer } = setup({ defaultView: ids.a })
    expect(shown()).toEqual(['View A'])
    // The icon sits in the tab, which carries the selected state.
    expect(screen.getByText('A').parentElement).toBe(tab('Menu A'))
    expect(tab('Menu A')).toHaveAttribute('aria-selected', 'true')
    expect(drawer).toHaveAttribute('data-state', 'open')
  })

  it('renders the default view: views with their own parts', () => {
    const { drawer } = setup({ defaultView: ids.a }, alternate)
    expect(screen.getByText('Title A')).toBeInTheDocument()
    expect(screen.getByText('Content A')).toBeInTheDocument()
    expect(screen.getByText('Footer A')).toBeInTheDocument()
    for (const text of ['Title B', 'Content B', 'Footer B', 'Title C', 'Content C', 'Footer C']) {
      expect(screen.queryByText(text)).toBeNull()
    }
    expect(tab('Menu A')).toHaveAttribute('aria-selected', 'true')
    expect(drawer).toHaveAttribute('data-state', 'open')
  })

  it('is openable from outside', async () => {
    const { drawer } = setup()
    await click('Open A')
    expect(shown()).toEqual(['View A'])
    expect(tab('Menu A')).toHaveAttribute('aria-selected', 'true')
    expect(drawer).toHaveAttribute('data-state', 'open')
  })

  it('navigates with its menu items', async () => {
    setup({ defaultView: ids.a })
    await userEvent.click(tab('Menu B'))
    expect(shown()).toEqual(['View B'])
    expect(tab('Menu B')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Menu A')).toHaveAttribute('aria-selected', 'false')
  })

  it('keeps a menu item open when activated again, unless it toggles', async () => {
    setup({ defaultView: ids.a })
    await userEvent.click(tab('Menu A'))
    expect(shown()).toEqual(['View A'])
    expect(tab('Menu A')).toHaveAttribute('aria-selected', 'true')
  })

  it('toggles its view with a toggle menu item', async () => {
    const { drawer } = setup({ defaultView: ids.a }, () => [
      menu([ids.a, ids.b], { toggle: true }),
      h(GsDrawerPanel, null, () => [
        h(GsDrawerView, { id: ids.a }, () => 'View A'),
        h(GsDrawerView, { id: ids.b }, () => 'View B'),
      ]),
    ])
    await userEvent.click(tab('Menu A'))
    expect(shown()).toEqual([])
    expect(drawer).toHaveAttribute('data-state', 'closed')
    await userEvent.click(tab('Menu B'))
    expect(shown()).toEqual(['View B'])
    await userEvent.click(tab('Menu A'))
    expect(shown()).toEqual(['View A'])
  })

  it('puts every menu item in the tab order', async () => {
    setup()
    await userEvent.tab()
    expect(tab('Menu A')).toHaveFocus()
    await userEvent.tab()
    expect(tab('Menu B')).toHaveFocus()
    await userEvent.tab()
    expect(tab('Menu C')).toHaveFocus()
  })

  it('activates menu items from the keyboard', async () => {
    setup()
    tab('Menu C').focus()
    await userEvent.keyboard('{Enter}')
    expect(shown()).toEqual(['View C'])
    tab('Menu B').focus()
    await userEvent.keyboard(' ')
    expect(shown()).toEqual(['View B'])
  })

  it('closes with a clear trigger', async () => {
    const { drawer } = setup({ defaultView: ids.a })
    await click('Close')
    expect(shown()).toEqual([])
    expect(drawer).toHaveAttribute('data-state', 'closed')
  })

  it('closes with a GsDrawerClose for a view id', async () => {
    const { drawer } = setup({ defaultView: ids.a })
    await click('close-with')
    expect(shown()).toEqual([])
    expect(drawer).toHaveAttribute('data-state', 'closed')
  })

  it('closes from outside with a GsDrawerClose for a view id', async () => {
    const { drawer } = setup({ defaultView: ids.a })
    await click('outside-close')
    expect(shown()).toEqual([])
    expect(drawer).toHaveAttribute('data-state', 'closed')
  })

  it('closes the surrounding drawer with a GsDrawerClose, named Close by default', async () => {
    setup({ defaultView: ids.a }, () =>
      h(GsDrawerPanel, null, () =>
        h(GsDrawerView, { id: ids.a }, () => [
          h(GsDrawerHeader, null, () => [
            h(GsDrawerHeaderTitle, null, () => 'A'),
            h(GsDrawerClose),
          ]),
          'View A',
        ]),
      ),
    )
    await click('Close')
    expect(shown()).toEqual([])
  })

  it('emits change with the shown view', async () => {
    const changes: (string | null)[] = []
    setup({ onChange: (view: string | null) => changes.push(view) })
    await click('Open A')
    await userEvent.click(tab('Menu B'))
    await click('Close')
    expect(changes).toEqual([ids.a, ids.b, null])
  })

  it('places the drawer with data attributes', () => {
    const { drawer } = setup({ placement: 'right', size: 'large', class: 'mine' })
    expect(drawer).toHaveAttribute('id', ids.drawer)
    expect(drawer).toHaveAttribute('data-placement', 'right')
    expect(drawer).toHaveAttribute('data-size', 'large')
    expect(drawer).toHaveClass('drawer', 'mine')
  })

  it('defaults to a medium drawer on the left', () => {
    const { drawer } = setup()
    expect(drawer).toHaveAttribute('data-placement', 'left')
    expect(drawer).toHaveAttribute('data-size', 'medium')
  })
})

describe('GsDrawerMenu', () => {
  it('is a navigation landmark holding a tab list', () => {
    setup({ defaultView: ids.a })
    const nav = screen.getByRole('navigation', { name: 'Views' })
    const list = within(nav).getByRole('tablist')
    expect(list).toHaveAttribute('aria-orientation', 'vertical')
    expect(within(list).getAllByRole('tab')).toHaveLength(3)
  })

  it('lays the tabs out horizontally on top and bottom drawers', () => {
    setup({ placement: 'bottom' })
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('applies its position as a class', () => {
    render(() =>
      h(GsDrawer, { id: ids.drawer }, () =>
        h(GsDrawerMenu, { position: 'end', 'aria-label': 'M' }),
      ),
    )
    expect(screen.getByRole('navigation')).toHaveClass('menu', 'end')
  })
})

describe('GsDrawerMenuItem', () => {
  it('links the selected tab and its panel', async () => {
    setup({ defaultView: ids.a })
    const panel = screen.getByRole('tabpanel', { name: 'Menu A' })
    expect(panel).toHaveAttribute('id', ids.a)
    expect(tab('Menu A')).toHaveAttribute('aria-controls', ids.a)
    expect(tab('Menu B')).not.toHaveAttribute('aria-controls')
    expect(tab('Menu A')).not.toHaveAttribute('aria-pressed')

    await userEvent.click(tab('Menu B'))
    expect(tab('Menu B')).toHaveAttribute('aria-controls', ids.b)
    expect(screen.getByRole('tabpanel', { name: 'Menu B' })).toHaveTextContent('View B')
  })

  it('stays selected while a view is pushed on top of its own', async () => {
    setup({ defaultView: ids.a }, shared, () => trigger(ids.b, 'Push B'))
    await click('Push B')
    expect(shown()).toEqual(['View B'])
    expect(tab('Menu A')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Menu B')).toHaveAttribute('aria-selected', 'true')
    expect(tab('Menu C')).toHaveAttribute('aria-selected', 'false')
  })

  it('shows its text value as a tooltip', async () => {
    setup()
    tab('Menu A').focus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Menu A')
  })

  it('uses accent icon toggle buttons, with classes for the item', () => {
    render(() =>
      h(GsDrawer, { id: ids.drawer }, () =>
        h(GsDrawerMenu, null, () =>
          h(
            GsDrawerMenuItem,
            { for: ids.a, textValue: 'A', classes: { item: 'my-item' } },
            () => 'A',
          ),
        ),
      ),
    )
    const item = tab('A')
    expect(item).toHaveClass('button', 'toggle', 'icon', 'item', 'my-item')
    expect(item).toHaveAttribute('data-color', 'accent')
  })

  it('applies classes to its tooltip', async () => {
    setup({}, () => menu([ids.a], { classes: { tooltip: 'my-tooltip' } }))
    tab('Menu A').focus()
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip.closest('.my-tooltip')).not.toBeNull()
  })

  it('can be disabled', async () => {
    setup({}, () => [
      menu([ids.a], { disabled: true }),
      h(GsDrawerView, { id: ids.a }, () => 'View A'),
    ])
    expect(tab('Menu A')).toBeDisabled()
    await userEvent.click(tab('Menu A'))
    expect(shown()).toEqual([])
  })

  it('renders nothing outside a drawer', () => {
    render(GsDrawerMenuItem, { props: { for: ids.a, textValue: 'A' } })
    expect(screen.queryByRole('tab')).toBeNull()
  })
})

describe('GsDrawerHeader', () => {
  const stacked = () =>
    h(GsDrawerPanel, null, () => [
      h(GsDrawerView, { id: ids.a }, () => [
        h(GsDrawerHeader, { title: 'Title A' }),
        h(GsDrawerFooter, null, () => trigger(ids.b, 'Show B')),
      ]),
      h(GsDrawerView, { id: ids.b }, () => h(GsDrawerHeader, { title: 'Title B' })),
    ])

  it('lays out a title header, with a back button and smaller title in pushed views', async () => {
    setup({ defaultView: ids.a }, stacked, () => null)
    expect(screen.getByRole('heading', { level: 2, name: 'Title A' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()

    await click('Show B')
    expect(screen.getByRole('heading', { level: 4, name: 'Title B' })).toBeInTheDocument()
    await click('Back')
    expect(screen.getByRole('heading', { level: 2, name: 'Title A' })).toBeInTheDocument()
  })

  it('closes the drawer from the title header', async () => {
    const { drawer } = setup({ defaultView: ids.a }, stacked, () => null)
    await click('Close')
    expect(drawer).toHaveAttribute('data-state', 'closed')
  })

  it('is a header element', () => {
    setup({ defaultView: ids.a }, stacked, () => null)
    expect(screen.getByRole('heading', { name: 'Title A' }).closest('.header')).not.toBeNull()
  })
})

describe('GsDrawerHeaderTitle', () => {
  it('sizes the title by level', () => {
    render(() => [
      h(GsDrawerHeaderTitle, null, () => 'Default'),
      h(GsDrawerHeaderTitle, { level: 5 }, () => 'Five'),
    ])
    expect(screen.getByRole('heading', { level: 2, name: 'Default' })).toHaveClass('title', 'large')
    expect(screen.getByRole('heading', { level: 5, name: 'Five' })).toHaveClass('title', 'medium')
  })
})

describe('GsDrawerBack and GsDrawerClose', () => {
  it('lets attributes replace the default names', async () => {
    setup({ defaultView: ids.a }, () =>
      h(GsDrawerPanel, null, () => [
        h(GsDrawerView, { id: ids.a }, () => [trigger(ids.b, 'Push B'), 'View A']),
        h(GsDrawerView, { id: ids.b }, () => [
          h(GsDrawerBack, { 'aria-label': 'Return' }),
          h(GsDrawerClose, { 'aria-label': 'Dismiss' }),
          'View B',
        ]),
      ]),
    )
    await click('Push B')
    await click('Return')
    expect(shown()).toEqual(['View A'])
    await click('Push B')
    await click('Dismiss')
    expect(shown()).toEqual([])
  })
})

describe('GsDrawerTrigger', () => {
  it('pushes views and runs chained targets', async () => {
    setup({ defaultView: ids.a }, shared, () => [
      trigger(ids.b, 'Push B'),
      trigger(['reset', ids.c], 'Reset and push C'),
      trigger([`reset:${ids.drawer}`, ids.c], 'Reset drawer and push C'),
      trigger(`toggle:${ids.c}`, 'Toggle C'),
    ])
    await click('Push B')
    expect(useDrawers().stack(ids.drawer)).toEqual([ids.a, ids.b])

    // Untargeted commands need a surrounding drawer, so only the push runs here.
    await click('Reset and push C')
    expect(useDrawers().stack(ids.drawer)).toEqual([ids.a, ids.b, ids.c])

    await click('Reset drawer and push C')
    expect(useDrawers().stack(ids.drawer)).toEqual([ids.a, ids.c])

    await click('Toggle C')
    expect(shown()).toEqual([])
    await click('Toggle C')
    expect(shown()).toEqual(['View C'])
  })
})

describe('useDrawers', () => {
  it('opens, toggles and closes drawers by view and drawer id', async () => {
    const { open, close, toggle, isOpen, view } = useDrawers()
    const opened = computed(() => isOpen(ids.drawer))
    setup()
    expect(opened.value).toBe(false)

    open(ids.b)
    await nextTick()
    expect(shown()).toEqual(['View B'])
    expect(opened.value).toBe(true)

    toggle(ids.c)
    await nextTick()
    expect(view(ids.drawer)).toBe(ids.c)

    toggle(ids.c)
    await nextTick()
    expect(opened.value).toBe(false)

    open(ids.a)
    close(ids.drawer)
    await nextTick()
    expect(shown()).toEqual([])
  })

  it('leaves plain view stacks and unknown ids alone', () => {
    const { open, close, toggle, isOpen } = useDrawers()
    expect(() => {
      open('nowhere')
      close('nowhere')
      toggle('nowhere')
    }).not.toThrow()
    expect(isOpen('nowhere')).toBe(false)
  })

  it('includes the view stack commands', async () => {
    const { push, back, reset, clear } = useDrawers()
    setup({ defaultView: ids.a })
    push(ids.b)
    await nextTick()
    expect(shown()).toEqual(['View B'])
    back(ids.drawer)
    await nextTick()
    expect(shown()).toEqual(['View A'])
    clear(ids.drawer)
    await nextTick()
    expect(shown()).toEqual([])
    reset(ids.drawer)
    await nextTick()
    expect(shown()).toEqual(['View A'])
  })
})

describe('GsDrawerLayout', () => {
  it('extends the side drawers by default and marks pushing edges', () => {
    render(GsDrawerLayout, {
      props: { push: 'left top' },
      attrs: { 'data-testid': 'layout' },
      slots: { default: () => h(GsDrawerLayoutMain, null, () => 'Main') },
    })
    const layout = screen.getByTestId('layout')
    expect(layout).toHaveClass('layout')
    expect(layout).toHaveAttribute('data-extend', 'left right')
    expect(layout).toHaveAttribute('data-push', 'left top')
    expect(screen.getByRole('main')).toHaveTextContent('Main')
    expect(screen.getByRole('main')).toHaveClass('main')
  })

  it('omits data-push when drawers float', () => {
    render(GsDrawerLayout, { props: { extend: 'top' }, attrs: { 'data-testid': 'layout' } })
    expect(screen.getByTestId('layout')).toHaveAttribute('data-extend', 'top')
    expect(screen.getByTestId('layout')).not.toHaveAttribute('data-push')
  })
})
