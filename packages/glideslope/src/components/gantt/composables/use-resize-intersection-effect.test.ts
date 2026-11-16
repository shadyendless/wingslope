import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'
import { useResizeIntersectionEffect } from './use-resize-intersection-effect'
import type { GsGanttTimelineChunkObject } from '../types'

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void

const observe = vi.fn()
const disconnect = vi.fn()
let observerCallback: ObserverCallback | undefined

beforeEach(() => {
  observe.mockClear()
  disconnect.mockClear()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: ObserverCallback) {
        observerCallback = callback
      }
      observe = observe
      disconnect = disconnect
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

const chunks: GsGanttTimelineChunkObject[] = [1, 2, 3, 4, 5].map((timestampMs) => ({ timestampMs }))

/** A container holding one element per chunk, as the timeline renders them. */
function createContainer(timestamps = chunks.map((chunk) => chunk.timestampMs)) {
  const container = document.createElement('div')
  for (const timestamp of timestamps) {
    const chunk = document.createElement('div')
    chunk.dataset.timestamp = String(timestamp)
    container.append(chunk)
  }
  document.body.append(container)
  return container
}

function run(container: HTMLElement | null) {
  const element = shallowRef(container)
  const onLayoutChange = vi.fn()
  const scope = effectScope()
  scope.run(() =>
    useResizeIntersectionEffect({
      timelineContainerElement: element,
      timelineChunks: chunks,
      onLayoutChange,
    }),
  )
  return { onLayoutChange, scope }
}

describe('useResizeIntersectionEffect', () => {
  it('does not observe without a container element', () => {
    run(null)

    expect(observe).not.toHaveBeenCalled()
  })

  it('does not observe when the threshold chunks are missing', () => {
    run(createContainer([1, 2]))

    expect(observe).not.toHaveBeenCalled()
  })

  it('observes the last and third-to-last chunks', () => {
    const container = createContainer()
    run(container)

    expect(observe).toHaveBeenCalledTimes(2)
    expect(observe).toHaveBeenCalledWith(container.querySelector('[data-timestamp="5"]'))
    expect(observe).toHaveBeenCalledWith(container.querySelector('[data-timestamp="3"]'))
  })

  it('reports a layout change when the last chunk comes into view', () => {
    const container = createContainer()
    const { onLayoutChange } = run(container)

    observerCallback?.([
      { target: container.querySelector('[data-timestamp="5"]')!, isIntersecting: true },
    ])

    expect(onLayoutChange).toHaveBeenCalledTimes(1)
  })

  it('reports a layout change when the third-to-last chunk leaves view', () => {
    const container = createContainer()
    const { onLayoutChange } = run(container)

    observerCallback?.([
      { target: container.querySelector('[data-timestamp="3"]')!, isIntersecting: true },
      { target: container.querySelector('[data-timestamp="5"]')!, isIntersecting: false },
    ])
    expect(onLayoutChange).not.toHaveBeenCalled()

    observerCallback?.([
      { target: container.querySelector('[data-timestamp="3"]')!, isIntersecting: false },
    ])
    expect(onLayoutChange).toHaveBeenCalledTimes(1)
  })

  it('disconnects the observer when stopped', async () => {
    const { scope } = run(createContainer())

    scope.stop()
    await nextTick()

    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
