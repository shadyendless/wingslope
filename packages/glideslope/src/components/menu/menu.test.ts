import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import PlaceholderIcon from '@wingbrace/glideslope-icons/placeholder'
import { describe, expect, it, vi } from 'vite-plus/test'
import { h, ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsContextMenu from './GsContextMenu.vue'
import GsMenu from './GsMenu.vue'
import GsMenuCheckboxItem from './GsMenuCheckboxItem.vue'
import GsMenuItem from './GsMenuItem.vue'
import GsMenuRadioGroup from './GsMenuRadioGroup.vue'
import GsMenuRadioItem from './GsMenuRadioItem.vue'
import GsMenuSection from './GsMenuSection.vue'
import GsMenuSeparator from './GsMenuSeparator.vue'
import GsMenuSubmenu from './GsMenuSubmenu.vue'

const trigger = (label: string) => () => h(GsButton, null, () => label)
const area = () => h('div', { 'data-testid': 'area', tabindex: 0 }, 'Right-click here')

describe('GsMenu', () => {
  it('reports the value of the chosen item with action', async () => {
    const onAction = vi.fn()
    const onSelect = vi.fn()
    render(GsMenu, {
      props: { onAction },
      slots: {
        trigger: trigger('Actions'),
        default: () => [
          h(GsMenuItem, { value: 'rename', label: 'Rename', onSelect }),
          h(GsMenuItem, { label: 'No value' }),
        ],
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Rename' }))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onAction).toHaveBeenCalledExactlyOnceWith('rename')

    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'No value' }))
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('reports items chosen in a submenu', async () => {
    const onAction = vi.fn()
    render(GsMenu, {
      props: { onAction },
      slots: {
        trigger: trigger('Actions'),
        default: () =>
          h(GsMenuSubmenu, { label: 'Export as' }, () =>
            h(GsMenuItem, { value: 'csv', label: 'CSV' }),
          ),
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Export as' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'CSV' }))
    expect(onAction).toHaveBeenCalledExactlyOnceWith('csv')
  })

  it('applies classes to the panel and the parts of items', async () => {
    render(GsMenu, {
      props: { classes: { popover: 'my-panel' } },
      slots: {
        trigger: trigger('Actions'),
        default: () => [
          h(
            GsMenuItem,
            {
              label: 'Rename',
              hotkey: 'R',
              classes: { text: 'my-text', hotkey: 'my-hotkey', icon: 'my-icon' },
            },
            () => h(GsIcon, null, () => h(PlaceholderIcon)),
          ),
          h(GsMenuSubmenu, {
            label: 'Export as',
            classes: { more: 'my-more', icon: 'my-sub-icon', text: 'my-sub-text' },
          }),
        ],
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const menu = await screen.findByRole('menu')
    expect(menu).toHaveClass('popover', 'menu', 'my-panel')

    const item = screen.getByRole('menuitem', { name: /Rename/ })
    expect(within(item).getByText('Rename')).toHaveClass('label', 'my-text')
    expect(within(item).getByText('R')).toHaveClass('hotkey', 'my-hotkey')
    expect(item.querySelector('.my-icon')).toHaveClass('icon')

    const submenu = screen.getByRole('menuitem', { name: /Export as/ })
    expect(within(submenu).getByText('Export as')).toHaveClass('my-sub-text')
    const more = submenu.querySelector('.my-more')
    expect(more).toHaveClass('more')
    // The slot-icon class stays off the chevron.
    expect(more).not.toHaveClass('my-sub-icon')
  })

  it('renders a custom section heading from the title slot', async () => {
    render(GsMenu, {
      slots: {
        trigger: trigger('Birds'),
        default: () =>
          h(
            GsMenuSection,
            { classes: { header: 'my-header' } },
            {
              title: () => [
                h('div', 'Additional Notable Species'),
                h('div', 'They sound made up.'),
              ],
              default: () => h(GsMenuItem, { label: 'Mallard' }),
            },
          ),
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Birds' }))
    const header = (await screen.findByText('Additional Notable Species')).parentElement
    expect(header).toHaveClass('header', 'my-header')
    expect(header).toHaveTextContent('They sound made up.')
  })
})

describe('GsContextMenu', () => {
  it('opens on right-click and reports actions', async () => {
    const onAction = vi.fn()
    render(GsContextMenu, {
      props: { onAction },
      slots: {
        trigger: area,
        default: () => [
          h(GsMenuItem, { value: 'copy', label: 'Copy' }),
          h(GsMenuSeparator),
          h(GsMenuSection, { title: 'More' }, () =>
            h(GsMenuItem, { value: 'delete', label: 'Delete' }),
          ),
        ],
      },
    })
    expect(screen.queryByRole('menu')).toBeNull()
    await fireEvent.contextMenu(screen.getByTestId('area'), { clientX: 40, clientY: 60 })
    const menu = await screen.findByRole('menu')
    expect(menu).toHaveClass('popover', 'menu', 'cozy')
    expect(within(menu).getByRole('separator')).toBeInTheDocument()
    expect(within(menu).getByRole('group')).toHaveTextContent('More')

    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }))
    expect(onAction).toHaveBeenCalledExactlyOnceWith('delete')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('supports checkbox, radio and submenu items', async () => {
    const grid = ref(false)
    const units = ref('metric')
    const onAction = vi.fn()
    render(() =>
      h(
        GsContextMenu,
        { onAction },
        {
          trigger: area,
          default: () => [
            h(GsMenuCheckboxItem, {
              label: 'Show grid',
              modelValue: grid.value,
              'onUpdate:modelValue': (v: boolean) => (grid.value = v),
            }),
            h(
              GsMenuRadioGroup,
              {
                modelValue: units.value,
                'onUpdate:modelValue': (v: unknown) => (units.value = v as string),
              },
              () => [
                h(GsMenuRadioItem, { value: 'metric', label: 'Metric' }),
                h(GsMenuRadioItem, { value: 'imperial', label: 'Imperial' }),
              ],
            ),
            h(GsMenuSubmenu, { label: 'Export as' }, () =>
              h(GsMenuItem, { value: 'kml', label: 'KML' }),
            ),
          ],
        },
      ),
    )
    const target = screen.getByTestId('area')
    await fireEvent.contextMenu(target)
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: /Show grid/ }))
    expect(grid.value).toBe(true)

    await fireEvent.contextMenu(target)
    await userEvent.click(await screen.findByRole('menuitemradio', { name: /Imperial/ }))
    expect(units.value).toBe('imperial')

    await fireEvent.contextMenu(target)
    await userEvent.click(await screen.findByRole('menuitem', { name: /Export as/ }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'KML' }))
    expect(onAction).toHaveBeenCalledExactlyOnceWith('kml')
  })

  it('keeps the browser menu when disabled', async () => {
    render(GsContextMenu, {
      props: { disabled: true },
      slots: { trigger: area, default: () => h(GsMenuItem, { label: 'Copy' }) },
    })
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    screen.getByTestId('area').dispatchEvent(event)
    await new Promise((resolve) => setTimeout(resolve))
    expect(event.defaultPrevented).toBe(false)
    expect(screen.queryByRole('menu')).toBeNull()
  })
})
