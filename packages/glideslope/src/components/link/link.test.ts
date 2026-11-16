import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { provideLinkDefaults } from './defaults'
import GsLink from './GsLink.vue'

// Hash links keep jsdom from attempting a real navigation.
const href = '#docs'

describe('GsLink visited state', () => {
  it('marks itself visited once clicked with allows-visited', async () => {
    const view = render(GsLink, {
      props: { href, allowsVisited: true },
      slots: { default: () => 'Docs' },
    })
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).not.toHaveAttribute('data-visited')
    await userEvent.click(link)
    expect(link).toHaveAttribute('data-visited')
    expect(view.emitted('update:visited')).toEqual([[true]])
  })

  it('does not track visits without allows-visited', async () => {
    const view = render(GsLink, { props: { href }, slots: { default: () => 'Docs' } })
    const link = screen.getByRole('link')
    await userEvent.click(link)
    expect(link).not.toHaveAttribute('data-visited')
    expect(view.emitted('update:visited')).toBeUndefined()
  })

  it('shows visited only while allows-visited is on', async () => {
    const view = render(GsLink, {
      props: { href, visited: true },
      slots: { default: () => 'Docs' },
    })
    const link = screen.getByRole('link')
    expect(link).not.toHaveAttribute('data-visited')
    await view.rerender({ href, visited: true, allowsVisited: true })
    expect(link).toHaveAttribute('data-visited')
  })

  it('does not mark a disabled link visited', async () => {
    const view = render(GsLink, {
      props: { href, disabled: true, allowsVisited: true },
      slots: { default: () => 'Docs' },
    })
    await userEvent.click(screen.getByText('Docs'))
    expect(screen.getByText('Docs')).not.toHaveAttribute('data-visited')
    expect(view.emitted('update:visited')).toBeUndefined()
  })
})

describe('GsLink defaults', () => {
  it('takes allows-visited and class from provided defaults, explicit props win', async () => {
    const Parent = defineComponent({
      setup() {
        provideLinkDefaults({ allowsVisited: true, class: 'from-parent' })
        return () => [
          h(GsLink, { href }, () => 'One'),
          h(GsLink, { href, allowsVisited: false }, () => 'Two'),
        ]
      },
    })
    render(Parent)
    const one = screen.getByRole('link', { name: 'One' })
    const two = screen.getByRole('link', { name: 'Two' })
    expect(one).toHaveClass('link', 'from-parent')
    await userEvent.click(one)
    await userEvent.click(two)
    expect(one).toHaveAttribute('data-visited')
    expect(two).not.toHaveAttribute('data-visited')
  })
})
