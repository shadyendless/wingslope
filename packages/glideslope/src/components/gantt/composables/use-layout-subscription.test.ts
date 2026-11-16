import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, shallowRef } from 'vue'
import { withGanttProviders } from '../__fixtures__/providers'
import { useLayoutSubscription } from './use-layout-subscription'

/** Runs animation frame callbacks right away. */
function immediateAnimationFrames() {
  return vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    callback(0)
    return 1
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useLayoutSubscription', () => {
  it('applies the layout on mount and on store updates, in an animation frame', async () => {
    const rafSpy = immediateAnimationFrames()
    const callback = vi.fn()

    const { store } = withGanttProviders(
      () => useLayoutSubscription({ selector: (state) => state.currentPositionMs, callback }),
      { startTimeMs: 100 },
    )

    expect(callback).toHaveBeenLastCalledWith(100)

    store.setCurrentPositionMs(500)
    await nextTick()

    // One frame for the initial layout, one for the store update
    expect(rafSpy).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith(500)
  })

  it('re-applies the layout when a source changes', async () => {
    immediateAnimationFrames()
    const source = shallowRef(1)
    const callback = vi.fn()

    withGanttProviders(
      () =>
        useLayoutSubscription({
          selector: (state) => state.currentPositionMs,
          callback: (value) => callback(value, source.value),
          sources: [source],
        }),
      { startTimeMs: 100 },
    )

    expect(callback).toHaveBeenLastCalledWith(100, 1)

    source.value = 2
    await nextTick()

    expect(callback).toHaveBeenLastCalledWith(100, 2)
  })

  it('compares the selected value shallowly', async () => {
    immediateAnimationFrames()
    const callback = vi.fn()

    const { store } = withGanttProviders(() =>
      useLayoutSubscription({
        selector: (state) => [Math.floor(state.currentRowScrollPx / 40)],
        callback,
      }),
    )

    callback.mockClear()
    store.setCurrentRowScrollPx(10)
    await nextTick()

    expect(callback).not.toHaveBeenCalled()

    store.setCurrentRowScrollPx(50)
    await nextTick()

    expect(callback).toHaveBeenCalledWith([1])
  })

  it('applies the layout at most once per frame', async () => {
    const frames: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const callback = vi.fn()

    const { store } = withGanttProviders(() =>
      useLayoutSubscription({ selector: (state) => state.currentPositionMs, callback }),
    )

    store.setCurrentPositionMs(1)
    await nextTick()
    store.setCurrentPositionMs(2)
    await nextTick()

    // Each update cancels the frame the previous one requested
    expect(cancelSpy).toHaveBeenCalledWith(2)
    frames.at(-1)?.(0)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(2)
  })

  it('cancels the pending animation frame on unmount', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(7)
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')

    const rendered = withGanttProviders(() =>
      useLayoutSubscription({ selector: (state) => state.currentPositionMs, callback: vi.fn() }),
    )

    rendered.unmount()

    expect(cancelSpy).toHaveBeenLastCalledWith(7)
  })
})
