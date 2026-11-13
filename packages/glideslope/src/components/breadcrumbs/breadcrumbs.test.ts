import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import GsBreadcrumbItem from './GsBreadcrumbItem.vue'
import GsBreadcrumbs from './GsBreadcrumbs.vue'

describe('GsBreadcrumbItem classes', () => {
  it('styles the link and separator, and puts class on the item', () => {
    render(GsBreadcrumbs, {
      slots: {
        default: () => [
          h(
            GsBreadcrumbItem,
            { href: '/', class: 'custom-item', classes: { link: 'custom-link', separator: 'sep' } },
            () => 'Home',
          ),
          h(GsBreadcrumbItem, { current: true, classes: { separator: 'sep' } }, () => 'Tracks'),
        ],
      },
    })
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).toHaveClass('link', 'custom-link')
    const item = link.closest('li')!
    expect(item).toHaveClass('item', 'custom-item')
    expect(item.querySelector('[aria-hidden="true"]')).toHaveClass('separator', 'sep')
    // The current item has no separator to style.
    expect(screen.getByText('Tracks').closest('li')!.querySelector('.sep')).toBeNull()
  })

  it('styles a link rendered with as-child', () => {
    render(GsBreadcrumbs, {
      slots: {
        default: () =>
          h(GsBreadcrumbItem, { asChild: true, classes: { link: 'custom-link' } }, () =>
            h('a', { href: '/home' }, 'Home'),
          ),
      },
    })
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('link', 'custom-link')
  })
})
