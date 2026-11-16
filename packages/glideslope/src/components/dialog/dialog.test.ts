import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { h, ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsDialog from './GsDialog.vue'
import GsDialogContent from './GsDialogContent.vue'
import GsDialogTitle from './GsDialogTitle.vue'

function setup(props: Record<string, unknown> = {}) {
  const open = ref(true)
  render(() =>
    h(
      GsDialog,
      { ...props, open: open.value, 'onUpdate:open': (v: boolean) => (open.value = v) },
      {
        trigger: () => h(GsButton, null, () => 'Rename'),
        default: () => [
          h(GsDialogTitle, null, () => 'Rename track'),
          h(GsDialogContent, null, () => 'Pick a new callsign.'),
        ],
      },
    ),
  )
  return open
}

describe('GsDialog', () => {
  it('stays open on Escape when keyboard dismissal is disabled', async () => {
    const open = setup({ keyboardDismissDisabled: true })
    await screen.findByRole('dialog', { name: 'Rename track' })
    await userEvent.keyboard('{Escape}')
    expect(open.value).toBe(true)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('applies classes to the backdrop and the panel', async () => {
    setup({ classes: { overlay: 'my-overlay', dialog: 'my-dialog' } })
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveClass('dialog', 'my-dialog')
    expect(dialog.parentElement).toHaveClass('overlay', 'my-overlay')
    expect(dialog.parentElement).not.toHaveAttribute('data-contained')
  })

  it('keeps the backdrop inside a portal target', async () => {
    const target = document.createElement('div')
    document.body.append(target)
    setup({ portalTo: target })
    const dialog = await screen.findByRole('dialog')
    expect(target.contains(dialog)).toBe(true)
    expect(dialog.parentElement).toHaveAttribute('data-contained')
    target.remove()
  })
})
