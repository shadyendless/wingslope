import { toValue, watch, type MaybeRefOrGetter } from 'vue'
import { injectGanttContext, injectTemporalDataContext } from '../context'
import { injectGanttStore } from '../store'
import { timestampWithinBounds } from '../utils/helpers'
import { deriveHorizontalScrollPosition } from '../utils/layout'

export interface UseScrollSyncOptions {
  horizontalScrollElement: MaybeRefOrGetter<HTMLElement | null>
}

/**
 * Keeps the user's place in time when the data or the scale changes.
 *
 * When `startTimeMs`, `endTimeMs` or the timescale changes, the content side scrolls back to the
 * time that was at the left edge, or to the start when that time is outside the new range. The
 * panel and content sides are also realigned with the root's vertical scroll.
 */
export function useScrollSync({ horizontalScrollElement }: UseScrollSyncOptions) {
  const { ganttContentElement, ganttPanelElement, rootElement } = injectGanttContext()
  const { totalBounds, msPerPx } = injectTemporalDataContext()
  const store = injectGanttStore()

  watch(
    [
      () => totalBounds.value.startMs,
      () => totalBounds.value.endMs,
      msPerPx,
      () => toValue(horizontalScrollElement),
      ganttContentElement,
      ganttPanelElement,
      rootElement,
    ],
    ([totalStartMs, totalEndMs, msPerPxValue, scrollElement]) => {
      if (!scrollElement) {
        return
      }

      // Read here, not watched: scrolling must not re-run this. It only runs when the data
      // (totalBounds) changes, or something that moves the effective scroll position (msPerPx,
      // which scales the timeline).
      const { currentPositionMs } = store.state
      const bounds = { startMs: totalStartMs, endMs: totalEndMs }
      const rootScrollTop = rootElement.value?.scrollTop ?? 0

      if (ganttContentElement.value) {
        ganttContentElement.value.scrollTop = rootScrollTop
      }
      if (ganttPanelElement.value) {
        ganttPanelElement.value.scrollTop = rootScrollTop
      }

      if (!timestampWithinBounds(currentPositionMs, bounds)) {
        scrollElement.scrollLeft = 0
        store.setCurrentPositionMs(totalStartMs)

        return
      }

      scrollElement.scrollLeft = deriveHorizontalScrollPosition(
        currentPositionMs,
        msPerPxValue,
        bounds,
      )
    },
    // After the DOM update, so the content has its new width before it is scrolled.
    { immediate: true, flush: 'post' },
  )
}
