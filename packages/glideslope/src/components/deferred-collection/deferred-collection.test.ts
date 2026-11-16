import { render, screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref } from 'vue'
import GsDeferredCollection from './GsDeferredCollection.vue'
import { useFrameDelay } from './use-frame-delay'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

async function advanceFrames(count: number) {
  for (let i = 0; i < count; i++) vi.advanceTimersToNextFrame()
  await nextTick()
}

describe('GsDeferredCollection', () => {
  it('shows the fallback, then the content after the default 2 frames', async () => {
    const content = vi.fn(() => h('p', 'Content'))
    render(GsDeferredCollection, {
      slots: { default: content, fallback: () => h('p', 'Loading') },
    })
    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    // The default slot isn't evaluated at all until the frames have passed.
    expect(content).not.toHaveBeenCalled()

    await advanceFrames(1)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()

    await advanceFrames(1)
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByText('Loading')).not.toBeInTheDocument()
  })

  it('waits deferFrames frames', async () => {
    render(GsDeferredCollection, {
      props: { deferFrames: 5 },
      slots: { default: () => h('p', 'Content') },
    })
    await advanceFrames(4)
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    await advanceFrames(1)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders nothing without a fallback while waiting', () => {
    const { container } = render(GsDeferredCollection, {
      slots: { default: () => h('p', 'Content') },
    })
    expect(container.textContent).toBe('')
  })
})

describe('useFrameDelay', () => {
  function setup(options: Parameters<typeof useFrameDelay>[0]) {
    let result!: ReturnType<typeof useFrameDelay>
    const Host = defineComponent({
      setup() {
        result = useFrameDelay(options)
        return () => null
      },
    })
    const rendered = render(Host)
    return { ...rendered, result }
  }

  it('starts not ready and becomes ready after the frames, calling onReady once', async () => {
    const onReady = vi.fn()
    const { result } = setup({ frames: 3, onReady })
    expect(result.ready.value).toBe(false)
    await advanceFrames(2)
    expect(result.ready.value).toBe(false)
    expect(onReady).not.toHaveBeenCalled()
    await advanceFrames(1)
    expect(result.ready.value).toBe(true)
    expect(onReady).toHaveBeenCalledTimes(1)
    await advanceFrames(3)
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('restarts the wait when a reactive frame count changes before it is ready', async () => {
    const frames = ref(2)
    const { result } = setup({ frames })
    await advanceFrames(1)
    frames.value = 4
    await nextTick()
    await advanceFrames(3)
    expect(result.ready.value).toBe(false)
    await advanceFrames(1)
    expect(result.ready.value).toBe(true)
  })

  it('cancels the pending frame on unmount', () => {
    const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame')
    const view = setup({})
    view.unmount()
    expect(cancel).toHaveBeenCalled()
    cancel.mockRestore()
  })
})
