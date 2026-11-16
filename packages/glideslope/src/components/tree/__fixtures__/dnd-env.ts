/**
 * jsdom gaps that dnd-kit's DOM layer relies on, for tests that drag with the keyboard. Import it
 * before rendering a drag-and-drop component. jsdom has no layout, so pointer drags (which hit-test
 * coordinates) aren't simulated; keyboard drags and the drop logic are.
 */
const stub = (target: object, name: string, value: unknown) => {
  if (typeof (target as Record<string, unknown>)[name] !== 'function') {
    Object.defineProperty(target, name, { value, configurable: true, writable: true })
  }
}

stub(document, 'getAnimations', () => [])
stub(Element.prototype, 'getAnimations', () => [])
stub(document, 'elementFromPoint', () => null)
stub(Element.prototype, 'animate', () => ({
  finished: Promise.resolve(),
  cancel() {},
  finish() {},
  pause() {},
  play() {},
}))
stub(window, 'matchMedia', (query: string) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
}))
if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = class {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds = []
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

/** The next animation frame and then a task, so whatever was queued for that frame has run. */
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)))

/**
 * Lets dnd-kit's scheduled work run. It batches DOM updates into animation frames, at times one
 * frame after another, so this waits for frames rather than a fixed time, which a busy machine can
 * outlast. `ms` adds a delay for its timers, such as the debounced announcements.
 */
export async function settle(ms = 0) {
  for (let frame = 0; frame < 3; frame++) await nextFrame()
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms))
}
