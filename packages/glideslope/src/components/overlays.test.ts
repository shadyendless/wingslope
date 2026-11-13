import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import GsButton from './button/GsButton.vue'
import GsDialog from './dialog/GsDialog.vue'
import GsDialogClose from './dialog/GsDialogClose.vue'
import GsDialogContent from './dialog/GsDialogContent.vue'
import GsDialogFooter from './dialog/GsDialogFooter.vue'
import GsDialogTitle from './dialog/GsDialogTitle.vue'
import GsMenu from './menu/GsMenu.vue'
import GsMenuCheckboxItem from './menu/GsMenuCheckboxItem.vue'
import GsMenuItem from './menu/GsMenuItem.vue'
import GsMenuRadioGroup from './menu/GsMenuRadioGroup.vue'
import GsMenuRadioItem from './menu/GsMenuRadioItem.vue'
import GsMenuSection from './menu/GsMenuSection.vue'
import GsPopover from './popover/GsPopover.vue'
import GsPopoverClose from './popover/GsPopoverClose.vue'
import GsPopoverContent from './popover/GsPopoverContent.vue'
import GsPopoverTitle from './popover/GsPopoverTitle.vue'
import GsTooltip from './tooltip/GsTooltip.vue'

const trigger = (label: string) => () => h(GsButton, null, () => label)

describe('GsTooltip', () => {
  it('shows its content when the trigger is focused', async () => {
    render(GsTooltip, {
      props: { delay: 0 },
      slots: { trigger: trigger('Settings'), default: () => 'Open settings' },
    })
    screen.getByRole('button', { name: 'Settings' }).focus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Open settings')
  })
})

describe('GsPopover', () => {
  it('opens a labelled dialog and closes from GsPopoverClose', async () => {
    render(GsPopover, {
      slots: {
        trigger: trigger('Details'),
        default: () => [
          h(GsPopoverTitle, null, () => 'RAVEN 21'),
          h(GsPopoverContent, null, () => 'F-16C at 24,000 ft'),
          h(GsPopoverClose, null, () => h(GsButton, null, () => 'Done')),
        ],
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Details' }))
    expect(await screen.findByRole('dialog', { name: 'RAVEN 21' })).toHaveTextContent('24,000 ft')

    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

describe('GsDialog', () => {
  function setup(props: Record<string, unknown> = {}) {
    const open = ref(false)
    render(() =>
      h(
        GsDialog,
        { ...props, open: open.value, 'onUpdate:open': (v: boolean) => (open.value = v) },
        {
          trigger: trigger('Delete track'),
          default: () => [
            h(GsDialogTitle, null, () => 'Delete RAVEN 21?'),
            h(GsDialogContent, null, () => 'This cannot be undone.'),
            h(GsDialogFooter, null, () => [
              h(GsDialogClose, null, () => h(GsButton, null, () => 'Cancel')),
              h(GsButton, { color: 'critical' }, () => 'Delete'),
            ]),
          ],
        },
      ),
    )
    return open
  }

  it('opens a modal dialog named by its title', async () => {
    const open = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Delete track' }))
    expect(open.value).toBe(true)
    expect(await screen.findByRole('dialog', { name: 'Delete RAVEN 21?' })).toBeInTheDocument()
  })

  it('sizes footer buttons to the dialog and closes from GsDialogClose', async () => {
    const open = setup({ size: 'large' })
    await userEvent.click(screen.getByRole('button', { name: 'Delete track' }))
    const cancel = await screen.findByRole('button', { name: 'Cancel' })
    expect(cancel).toHaveAttribute('data-size', 'medium')

    await userEvent.click(cancel)
    expect(open.value).toBe(false)
  })

  it('closes on Escape', async () => {
    const open = setup()
    await userEvent.click(screen.getByRole('button', { name: 'Delete track' }))
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(open.value).toBe(false)
  })
})

describe('GsMenu', () => {
  it('runs an item action and closes', async () => {
    const onRename = vi.fn()
    render(GsMenu, {
      slots: {
        trigger: trigger('Actions'),
        default: () => [
          h(GsMenuItem, { label: 'Rename', hotkey: 'R', onSelect: onRename }),
          h(GsMenuItem, { label: 'Delete', color: 'critical', disabled: true }),
        ],
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Actions' }))
    const menu = await screen.findByRole('menu')
    expect(menu).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Delete/ })).toHaveAttribute('data-disabled')

    await userEvent.click(screen.getByRole('menuitem', { name: /Rename/ }))
    expect(onRename).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('supports checkbox and radio items', async () => {
    const grid = ref(false)
    const units = ref('metric')
    render(() =>
      h(GsMenu, null, {
        trigger: trigger('View'),
        default: () => [
          h(GsMenuCheckboxItem, {
            label: 'Show grid',
            modelValue: grid.value,
            'onUpdate:modelValue': (v: boolean) => (grid.value = v),
          }),
          h(GsMenuSection, { title: 'Units' }, () =>
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
          ),
        ],
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'View' }))
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: /Show grid/ }))
    expect(grid.value).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'View' }))
    expect(await screen.findByRole('menuitemradio', { name: /Metric/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await userEvent.click(screen.getByRole('menuitemradio', { name: /Imperial/ }))
    expect(units.value).toBe('imperial')
  })
})

describe('nested overlay triggers', () => {
  const menuItems = () => [h(GsMenuItem, { label: 'Rename' })]

  it('opens a menu and a tooltip from one button when the tooltip wraps the menu', async () => {
    render(GsTooltip, {
      props: { delay: 0 },
      slots: {
        trigger: () => h(GsMenu, null, { trigger: trigger('Actions'), default: menuItems }),
        default: () => 'Track actions',
      },
    })
    const button = screen.getByRole('button', { name: 'Actions' })
    button.focus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Track actions')
    await userEvent.click(button)
    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })

  it('opens a menu and a tooltip from one button when the menu wraps the tooltip', async () => {
    render(GsMenu, {
      slots: {
        trigger: () =>
          h(
            GsTooltip,
            { delay: 0 },
            { trigger: trigger('Actions'), default: () => 'Track actions' },
          ),
        default: menuItems,
      },
    })
    const button = screen.getByRole('button', { name: 'Actions' })
    button.focus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Track actions')
    await userEvent.click(button)
    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })
})
