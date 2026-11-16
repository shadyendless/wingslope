import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { h, ref } from 'vue'
import GsPagination from './GsPagination.vue'

const current = () => screen.getByRole('button', { current: 'page' })

describe('GsPagination', () => {
  it('starts an uncontrolled pagination on default-value and keeps its own page', async () => {
    const changes: number[] = []
    render(GsPagination, {
      props: { total: 10, defaultValue: 3, 'onUpdate:modelValue': (v: number) => changes.push(v) },
    })
    expect(screen.getByRole('navigation', { name: 'Page 3 of 10' })).toBeInTheDocument()
    expect(current()).toHaveAccessibleName('Page 3')

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(changes).toEqual([4])
    expect(current()).toHaveAccessibleName('Page 4')
    expect(screen.getByRole('navigation', { name: 'Page 4 of 10' })).toBeInTheDocument()
  })

  it('starts on page 1 without v-model or default-value', () => {
    render(GsPagination, { props: { total: 4 } })
    expect(current()).toHaveAccessibleName('Page 1')
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  })

  it('follows v-model over default-value', async () => {
    const page = ref(2)
    render(() =>
      h(GsPagination, {
        total: 10,
        defaultValue: 5,
        modelValue: page.value,
        'onUpdate:modelValue': (v: number) => (page.value = v),
      }),
    )
    expect(current()).toHaveAccessibleName('Page 2')
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(page.value).toBe(1)
    expect(current()).toHaveAccessibleName('Page 1')
  })

  it('puts class on the nav container and classes on the buttons', () => {
    render(GsPagination, {
      props: {
        total: 3,
        classes: { prev: 'custom-prev', pages: 'custom-page', next: 'custom-next' },
      },
      attrs: { class: 'custom-container' },
    })
    const nav = screen.getByRole('navigation')
    expect(nav).toHaveClass('container', 'custom-container')
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveClass('custom-prev')
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveClass('custom-next')
    for (const name of ['Page 1', 'Page 2', 'Page 3']) {
      expect(screen.getByRole('button', { name })).toHaveClass('custom-page')
    }
    // The buttons are the container's own children, so its flex layout applies to them.
    expect(screen.getByRole('button', { name: 'Next page' }).parentElement).toBe(nav)
  })

  it('hides the page buttons while loading', async () => {
    const loading = ref(true)
    render(() => h(GsPagination, { total: 5, loading: loading.value }))
    expect(screen.queryByRole('button', { name: 'Page 1' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    loading.value = false
    expect(await screen.findByRole('button', { name: 'Page 1' })).toBeInTheDocument()
  })
})
