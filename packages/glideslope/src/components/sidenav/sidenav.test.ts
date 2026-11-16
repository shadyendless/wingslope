import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import PlaceholderIcon from '@wingbrace/glideslope-icons/placeholder'
import { describe, expect, it } from 'vite-plus/test'
import { computed, h, nextTick, ref, type VNodeChild } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsDivider from '../divider/GsDivider.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsSidenav from './GsSidenav.vue'
import GsSidenavAvatar from './GsSidenavAvatar.vue'
import GsSidenavContent from './GsSidenavContent.vue'
import GsSidenavFooter from './GsSidenavFooter.vue'
import GsSidenavHeader from './GsSidenavHeader.vue'
import GsSidenavHeading from './GsSidenavHeading.vue'
import GsSidenavItem from './GsSidenavItem.vue'
import GsSidenavLink from './GsSidenavLink.vue'
import GsSidenavMenu from './GsSidenavMenu.vue'
import GsSidenavMenuItem from './GsSidenavMenuItem.vue'
import GsSidenavText from './GsSidenavText.vue'
import GsSidenavTrigger from './GsSidenavTrigger.vue'
import { useSidenavs } from './use-sidenavs'

const id = 'sidenav'

const icon = (props: Record<string, unknown> = {}) => h(GsIcon, props, () => h(PlaceholderIcon))
const heading = (text: string) => h(GsSidenavHeading, null, () => text)
const text = (value: string) => h(GsSidenavText, null, () => value)

const children = () => [
  h(GsSidenavHeader, null, () =>
    h(GsSidenavAvatar, null, () => [
      icon({ 'data-testid': 'logo' }),
      heading('Application Header'),
      text('subheader'),
    ]),
  ),
  h(GsSidenavContent, null, () => [
    heading('Title'),
    h(GsSidenavItem, { textValue: 'Nav item' }, () => [icon(), text('Nav item')]),
    h(GsDivider),
    heading('External'),
    h(GsSidenavLink, { href: '#', textValue: 'Link item' }, () => [icon(), text('Link item')]),
    h(GsDivider),
    heading('Menu'),
    h(
      GsSidenavMenu,
      { title: 'Settings', 'data-testid': 'menu' },
      {
        icon: () => icon(),
        default: () => [
          h(GsSidenavMenuItem, null, () => text('Menu Item')),
          h(GsSidenavMenuItem, null, () => text('Menu Item 2')),
        ],
      },
    ),
  ]),
  h(GsSidenavFooter, null, () =>
    h(GsSidenavAvatar, null, () => [
      icon({ 'data-testid': 'avatar' }),
      heading('FullName'),
      text('test@example.com'),
    ]),
  ),
]

function setup(
  props: Record<string, unknown> = {},
  outside: () => VNodeChild = () =>
    h(GsSidenavTrigger, { for: id }, () => h(GsButton, null, () => 'Open')),
) {
  render(() => [
    h(GsSidenav, { id, 'data-testid': 'nav', 'aria-label': 'Main', ...props }, children),
    outside(),
  ])
}

const nav = () => screen.getByTestId('nav')

describe('GsSidenav', () => {
  it('marks expanded-only content transient, and opens the collapsed menu in a panel', async () => {
    setup()
    for (const value of [
      'Application Header',
      'subheader',
      'Title',
      'Nav item',
      'External',
      'Link item',
      'FullName',
      'test@example.com',
    ]) {
      expect(screen.getByText(value)).toHaveClass('transient')
    }
    expect(screen.getByTestId('menu')).toBeInTheDocument()
    expect(screen.queryByText('Menu Item')).toBeNull()

    await userEvent.click(screen.getByTestId('menu'))
    const panel = await screen.findByRole('dialog', { name: 'Settings' })
    expect(within(panel).getByText('Menu Item')).toBeInTheDocument()
    expect(within(panel).getByText('Menu Item 2')).toBeInTheDocument()
  })

  it('marks the external-link arrow transient so it hides when collapsed', () => {
    setup()
    const link = screen.getByRole('link', { name: 'Link item' })
    const icons = link.querySelectorAll('.icon')
    expect(icons[0]).not.toHaveClass('transient')
    expect(icons[icons.length - 1]).toHaveClass('transient')
  })

  it('opens and closes from outside', async () => {
    setup()
    expect(nav()).toHaveAttribute('data-state', 'closed')
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(nav()).toHaveAttribute('data-state', 'open')
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(nav()).toHaveAttribute('data-state', 'closed')
  })

  it('opens and closes from its header', async () => {
    setup()
    await userEvent.click(screen.getByTestId('logo'))
    expect(nav()).toHaveAttribute('data-state', 'open')
    await userEvent.click(screen.getByTestId('logo'))
    expect(nav()).toHaveAttribute('data-state', 'closed')
  })

  it('is a named navigation landmark with the sidenav id', () => {
    setup()
    expect(screen.getByRole('navigation', { name: 'Main' })).toHaveAttribute('id', id)
    expect(nav()).toHaveClass('sidenav')
  })

  it('binds the open state with v-model:open', async () => {
    const open = ref(true)
    render(() => [
      h(
        GsSidenav,
        {
          id,
          'data-testid': 'nav',
          open: open.value,
          'onUpdate:open': (value: boolean) => (open.value = value),
        },
        children,
      ),
      h(GsSidenavTrigger, { for: id }, () => h(GsButton, null, () => 'Toggle')),
    ])
    expect(nav()).toHaveAttribute('data-state', 'open')
    await userEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    expect(open.value).toBe(false)
    expect(nav()).toHaveAttribute('data-state', 'closed')

    open.value = true
    await nextTick()
    expect(nav()).toHaveAttribute('data-state', 'open')
    expect(useSidenavs().isOpen(id)).toBe(true)
  })

  it('renders nothing while closed with hidden-when-closed', async () => {
    setup({ hiddenWhenClosed: true })
    expect(screen.queryByRole('navigation')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('drops its state when it unmounts', async () => {
    const shown = ref(true)
    render(() => (shown.value ? h(GsSidenav, { id, open: true }, children) : null))
    expect(useSidenavs().isOpen(id)).toBe(true)
    shown.value = false
    await nextTick()
    expect(useSidenavs().isOpen(id)).toBe(false)
  })
})

describe('useSidenavs', () => {
  it('opens, closes and toggles sidenavs by id, and reads their state reactively', async () => {
    const { open, close, toggle, isOpen } = useSidenavs()
    const expanded = computed(() => isOpen(id))
    setup()
    expect(expanded.value).toBe(false)

    open(id)
    await nextTick()
    expect(nav()).toHaveAttribute('data-state', 'open')
    expect(expanded.value).toBe(true)

    open(id)
    await nextTick()
    expect(expanded.value).toBe(true)

    toggle(id)
    await nextTick()
    expect(nav()).toHaveAttribute('data-state', 'closed')

    toggle(id)
    close(id)
    await nextTick()
    expect(expanded.value).toBe(false)
  })

  it('ignores unknown ids', () => {
    const { open, isOpen } = useSidenavs()
    open('nowhere')
    expect(isOpen('nowhere')).toBe(false)
  })
})

describe('GsSidenavTrigger', () => {
  it('reports what it toggles', async () => {
    setup()
    const trigger = screen.getByRole('button', { name: 'Open' })
    expect(trigger).toHaveAttribute('aria-controls', id)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('runs open and close commands', async () => {
    setup({}, () => [
      h(GsSidenavTrigger, { for: `open:${id}` }, () => h(GsButton, null, () => 'Expand')),
      h(GsSidenavTrigger, { for: `close:${id}` }, () => h(GsButton, null, () => 'Collapse')),
    ])
    const expand = screen.getByRole('button', { name: 'Expand' })
    expect(expand).not.toHaveAttribute('aria-expanded')
    await userEvent.click(expand)
    await userEvent.click(expand)
    expect(nav()).toHaveAttribute('data-state', 'open')
    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }))
    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }))
    expect(nav()).toHaveAttribute('data-state', 'closed')
  })

  it('works from the keyboard', async () => {
    setup()
    screen.getByRole('button', { name: 'Open' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(nav()).toHaveAttribute('data-state', 'open')
  })
})

describe('GsSidenavHeader', () => {
  it('is a header with an expanded-state toggle named by its avatar', async () => {
    setup()
    const toggle = screen.getByRole('button', { name: /^Application Header\s*subheader$/ })
    expect(toggle.closest('header')).toHaveClass('header')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', id)
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('applies classes to its parts', () => {
    render(GsSidenav, {
      props: { id },
      slots: {
        default: () =>
          h(GsSidenavHeader, {
            classes: { header: 'my-header', button: 'my-button', icon: 'my-icon' },
          }),
      },
    })
    const toggle = screen.getByRole('button')
    expect(toggle).toHaveClass('toggle', 'my-button')
    expect(toggle.closest('header')).toHaveClass('my-header')
    expect(toggle.querySelector('.icon')).toHaveClass('transient', 'my-icon')
  })
})

describe('GsSidenavHeading and GsSidenavText', () => {
  it('render section headings, and plain text inside buttons', () => {
    setup()
    expect(screen.getByRole('heading', { level: 3, name: 'Title' })).toHaveClass('heading')
    expect(screen.getByText('Application Header').tagName).toBe('SPAN')
    expect(screen.getByText('Application Header')).toHaveClass('avatarHeading')
    expect(screen.getByText('subheader')).toHaveClass('avatarText')
    expect(screen.getByText('Nav item')).toHaveClass('text')
    expect(screen.getByRole('heading', { level: 3, name: 'FullName' })).toHaveClass('avatarHeading')
  })
})

describe('GsSidenavAvatar and GsSidenavContent', () => {
  it('size and place avatar icons, and space dividers', () => {
    setup()
    expect(screen.getByTestId('avatar')).toHaveClass('avatarIcon')
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', 'large')
    expect(screen.getAllByRole('separator')[0]).toHaveClass('divider')
  })
})

describe('GsSidenavItem', () => {
  it('toggles its selected state with v-model', async () => {
    const selected = ref(false)
    render(GsSidenav, {
      props: { id },
      slots: {
        default: () =>
          h(
            GsSidenavItem,
            {
              textValue: 'Map',
              modelValue: selected.value,
              'onUpdate:modelValue': (value: boolean) => (selected.value = value),
            },
            () => [icon(), text('Map')],
          ),
      },
    })
    const item = screen.getByRole('button', { name: 'Map' })
    expect(item).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(item)
    expect(selected.value).toBe(true)
    expect(item).toHaveAttribute('aria-pressed', 'true')
    expect(item).toHaveClass('item')
  })

  it('shows its tooltip only while the sidenav is collapsed', async () => {
    const open = ref(false)
    render(() =>
      h(GsSidenav, { id, open: open.value }, () =>
        h(GsSidenavItem, { textValue: 'Map tooltip' }, () => [icon(), text('Map')]),
      ),
    )
    const item = screen.getByRole('button', { name: 'Map' })
    item.focus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Map tooltip')
    item.blur()
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())

    open.value = true
    await nextTick()
    item.focus()
    await new Promise((resolve) => setTimeout(resolve, 300))
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('styles its tooltip as one line of body text, greyed out while disabled', async () => {
    render(GsSidenav, {
      props: { id },
      slots: {
        default: () => [
          h(GsSidenavItem, { textValue: 'Map tooltip' }, () => [icon(), text('Map')]),
          h(GsSidenavItem, { textValue: 'Off tooltip', disabled: true }, () => [
            icon(),
            text('Off'),
          ]),
        ],
      },
    })
    screen.getByRole('button', { name: 'Map' }).focus()
    const content = (await screen.findByRole('tooltip')).closest('.tooltip')
    expect(content).not.toBeNull()
    expect(content).not.toHaveClass('tooltipDisabled')

    await userEvent.hover(screen.getByRole('button', { name: 'Off' }))
    const disabled = await screen.findByRole('tooltip', { name: 'Off tooltip' })
    expect(disabled.closest('.tooltip')).toHaveClass('tooltipDisabled')
  })

  it('can be disabled, and styles its icons', () => {
    render(GsSidenav, {
      props: { id },
      slots: {
        default: () =>
          h(
            GsSidenavItem,
            { disabled: true, classes: { button: 'my-item', icon: 'my-icon' } },
            () => [icon({ 'data-testid': 'icon' }), text('Map')],
          ),
      },
    })
    const item = screen.getByRole('button', { name: 'Map' })
    expect(item).toBeDisabled()
    expect(item).toHaveClass('my-item')
    expect(screen.getByTestId('icon')).toHaveClass('my-icon')
  })
})

describe('GsSidenavLink', () => {
  it('styles its tooltip, greyed out while disabled', async () => {
    render(GsSidenav, {
      props: { id },
      slots: {
        default: () =>
          h(GsSidenavLink, { href: '/off', textValue: 'Off', disabled: true }, () => text('Off')),
      },
    })
    ;(screen.getByText('Off').closest('a') as HTMLElement).focus()
    const content = (await screen.findByRole('tooltip')).closest('.tooltip')
    expect(content).toHaveClass('tooltipDisabled')
    expect(content?.querySelector('.icon')).not.toBeNull()
  })

  it('drops its href while disabled', async () => {
    let clicks = 0
    render(GsSidenav, {
      props: { id },
      slots: {
        default: () => [
          h(GsSidenavLink, { href: '/docs', textValue: 'Docs' }, () => text('Docs')),
          h(
            GsSidenavLink,
            { href: '/off', textValue: 'Off', disabled: true, onClick: () => clicks++ },
            () => text('Off'),
          ),
        ],
      },
    })
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
    const off = screen.getByText('Off').closest('a') as HTMLElement
    expect(off).not.toHaveAttribute('href')
    expect(off).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(off)
    expect(clicks).toBe(0)
  })
})

describe('GsSidenavMenu', () => {
  const menu = (props: Record<string, unknown> = {}) =>
    h(
      GsSidenavMenu,
      { title: 'Settings', ...props },
      {
        icon: () => icon(),
        default: () => [
          h(GsSidenavMenuItem, null, () => text('Profile')),
          h(GsSidenavMenuItem, { disabled: true }, () => text('Security')),
        ],
      },
    )

  it('expands its items in place while the sidenav is open', async () => {
    render(GsSidenav, { props: { id, open: true }, slots: { default: () => menu() } })
    const trigger = screen.getByRole('button', { name: 'Settings' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Profile')).toBeNull()

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    const group = screen.getByRole('group', { name: 'Settings' })
    expect(trigger).toHaveAttribute('aria-controls', group.id)
    const profile = within(group).getByRole('button', { name: 'Profile' })
    expect(profile).toHaveClass('menuItem')
    expect(within(group).getByRole('button', { name: 'Security' })).toBeDisabled()

    await userEvent.click(profile)
    expect(profile).toHaveAttribute('aria-pressed', 'true')
  })

  it('binds the expanded state with v-model:expanded', async () => {
    const expanded = ref(true)
    render(GsSidenav, {
      props: { id, open: true },
      slots: {
        default: () =>
          menu({
            expanded: expanded.value,
            'onUpdate:expanded': (value: boolean) => (expanded.value = value),
          }),
      },
    })
    expect(screen.getByRole('group', { name: 'Settings' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(expanded.value).toBe(false)
  })

  it('shows its title as a styled tooltip while the sidenav is collapsed', async () => {
    render(GsSidenav, { props: { id }, slots: { default: () => menu() } })
    screen.getByRole('button', { name: 'Settings' }).focus()
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Settings')
    expect(tooltip.closest('.tooltip')).not.toBeNull()
  })

  it('opens its items in a titled panel while the sidenav is collapsed', async () => {
    render(GsSidenav, {
      props: { id },
      slots: {
        default: () => menu({ classes: { popoverPanel: 'my-panel', panelContent: 'my-content' } }),
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }))
    const panel = await screen.findByRole('dialog', { name: 'Settings' })
    expect(panel).toHaveClass('panel', 'my-panel')
    expect(within(panel).getByRole('heading', { level: 3, name: 'Settings' })).toHaveClass(
      'panelHeading',
    )
    expect(within(panel).getByRole('button', { name: 'Profile' })).toHaveClass('panelItem')
    expect(within(panel).getByText('Profile').parentElement?.parentElement).toHaveClass(
      'panelContent',
      'my-content',
    )
  })

  it('applies classes to the expanded menu', () => {
    render(GsSidenav, {
      props: { id, open: true },
      slots: {
        default: () =>
          menu({
            expanded: true,
            classes: {
              menu: 'my-menu',
              button: 'my-button',
              icon: 'my-icon',
              disclosurePanel: 'my-panel',
            },
          }),
      },
    })
    const trigger = screen.getByRole('button', { name: 'Settings' })
    expect(trigger).toHaveClass('trigger', 'my-button')
    expect(trigger.parentElement).toHaveClass('menu', 'my-menu')
    expect(trigger.querySelector('.my-icon')).toHaveClass('transient')
    expect(screen.getByRole('group')).toHaveClass('my-panel')
  })
})
