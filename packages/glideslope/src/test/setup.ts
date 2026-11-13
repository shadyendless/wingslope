import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterEach } from 'vitest'

// jsdom gaps that Reka UI's popper, select, slider and listbox code relies on.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

const elementStubs = {
  scrollIntoView: () => {},
  hasPointerCapture: () => false,
  releasePointerCapture: () => {},
  setPointerCapture: () => {},
}
for (const [name, value] of Object.entries(elementStubs)) {
  if (!(name in Element.prototype)) {
    Object.defineProperty(Element.prototype, name, { value, configurable: true, writable: true })
  }
}

afterEach(() => {
  cleanup()
})
