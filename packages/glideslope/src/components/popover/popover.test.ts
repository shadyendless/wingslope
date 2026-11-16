import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsPopover from './GsPopover.vue'
import GsPopoverContent from './GsPopoverContent.vue'
import GsPopoverTitle from './GsPopoverTitle.vue'

const trigger = () => h(GsButton, null, () => 'Legend')

describe('GsPopover', () => {
  it('applies classes.popover to the panel', async () => {
    render(GsPopover, {
      props: { classes: { popover: 'min-w-sm' } },
      slots: { trigger, default: () => h(GsPopoverContent, null, () => 'Roads') },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Legend' }))
    expect(await screen.findByRole('dialog')).toHaveClass('popover', 'min-w-sm')
  })

  it('is named by its trigger without a title or label', async () => {
    render(GsPopover, {
      slots: { trigger, default: () => h(GsPopoverContent, null, () => 'Roads') },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Legend' }))
    expect(await screen.findByRole('dialog', { name: 'Legend' })).toBeInTheDocument()
  })

  it('is named by label when it has no title, each time it opens', async () => {
    render(GsPopover, {
      props: { label: 'Layer legend' },
      slots: { trigger, default: () => h(GsPopoverContent, null, () => 'Roads') },
    })
    const button = screen.getByRole('button', { name: 'Legend' })
    await userEvent.click(button)
    expect(await screen.findByRole('dialog', { name: 'Layer legend' })).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await userEvent.click(button)
    expect(await screen.findByRole('dialog', { name: 'Layer legend' })).toBeInTheDocument()
  })

  it('prefers a title over label', async () => {
    render(GsPopover, {
      props: { label: 'Layer legend' },
      slots: {
        trigger,
        default: () => [
          h(GsPopoverTitle, null, () => 'Map layers'),
          h(GsPopoverContent, null, () => 'Roads'),
        ],
      },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Legend' }))
    expect(await screen.findByRole('dialog', { name: 'Map layers' })).toBeInTheDocument()
  })
})
