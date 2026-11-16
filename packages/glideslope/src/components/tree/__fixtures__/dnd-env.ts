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

/** Lets dnd-kit's scheduled work (animation frames, microtasks, debounced announcements) run. */
export const settle = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms))
