import { injectGanttContext } from '../context'
import { injectGanttStore } from '../store'
import { getVerticalScrolledPixels } from '../utils/helpers'

/**
 * Tracks the root's vertical scroll, and scrolls the panel and content sides with it. They don't
 * scroll vertically themselves (their overflow is hidden); the root holds the scroll range.
 */
export function useVerticalScrollUpdate() {
  const { ganttContentElement, ganttPanelElement } = injectGanttContext()
  const { setCurrentRowScrollPx } = injectGanttStore()

  function onScroll(event: Event) {
    const scrolledPixels = getVerticalScrolledPixels(event)

    setCurrentRowScrollPx(scrolledPixels)
    // `scrollTop` rather than the Design Toolkit's `scrollTo({ top })`: the same instant scroll.
    if (ganttPanelElement.value) {
      ganttPanelElement.value.scrollTop = scrolledPixels
    }
    if (ganttContentElement.value) {
      ganttContentElement.value.scrollTop = scrolledPixels
    }
  }

  return { onScroll }
}
