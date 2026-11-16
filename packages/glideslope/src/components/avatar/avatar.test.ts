import { render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick } from 'vue'
import { provideAvatarDefaults } from './defaults'
import GsAvatar from './GsAvatar.vue'

/** Stands in for the `Image` that Reka loads the avatar `src` with, so tests decide the outcome. */
class FakeImage extends EventTarget {
  static last: FakeImage | undefined
  src = ''
  complete = false
  naturalWidth = 0
  constructor() {
    super()
    FakeImage.last = this
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  FakeImage.last = undefined
})

describe('GsAvatar defaults', () => {
  it('takes size and class from provided defaults, explicit size wins', () => {
    const Parent = defineComponent({
      setup() {
        provideAvatarDefaults({ size: 'small', class: 'from-parent' })
        return () => [h(GsAvatar, { alt: 'A' }), h(GsAvatar, { alt: 'B', size: 'medium' })]
      },
    })
    render(Parent)
    const a = screen.getByRole('img', { name: 'A' })
    expect(a).toHaveAttribute('data-size', 'small')
    expect(a).toHaveClass('avatar', 'from-parent')
    expect(screen.getByRole('img', { name: 'B' })).toHaveAttribute('data-size', 'medium')
  })

  it('sizes its fallback icon from the provided size', async () => {
    const Parent = defineComponent({
      setup() {
        provideAvatarDefaults({ size: 'small' })
        return () => h(GsAvatar, { alt: 'A' })
      },
    })
    const { container } = render(Parent)
    await nextTick()
    expect(container.querySelector('.icon')).toHaveAttribute('data-size', 'medium')
  })
})

describe('GsAvatar image events', () => {
  it('emits load once the image has loaded', async () => {
    vi.stubGlobal('Image', FakeImage)
    const onLoad = vi.fn()
    const onError = vi.fn()
    render(GsAvatar, { props: { src: '/jo.png', alt: 'Jo', onLoad, onError } })
    await nextTick()
    expect(FakeImage.last?.src).toBe('/jo.png')
    FakeImage.last?.dispatchEvent(new Event('load'))
    await nextTick()
    expect(onLoad).toHaveBeenCalledOnce()
    expect(onError).not.toHaveBeenCalled()
  })

  it('emits error when the image fails, and keeps the fallback', async () => {
    vi.stubGlobal('Image', FakeImage)
    const onLoad = vi.fn()
    const onError = vi.fn()
    render(GsAvatar, {
      props: { src: '/missing.png', alt: 'Jo', onLoad, onError },
      slots: { fallback: () => 'JR' },
    })
    await nextTick()
    FakeImage.last?.dispatchEvent(new Event('error'))
    await nextTick()
    expect(onError).toHaveBeenCalledOnce()
    expect(onLoad).not.toHaveBeenCalled()
    expect(await screen.findByText('JR')).toBeInTheDocument()
  })

  it('does not emit error without a src', async () => {
    const onError = vi.fn()
    render(GsAvatar, { props: { alt: 'Jo', onError } })
    await nextTick()
    expect(onError).not.toHaveBeenCalled()
  })
})
