import { injectTemporalDataContext } from '../context'
import { injectGanttStore } from '../store'
import { getHorizontalScrolledPixels } from '../utils/helpers'

/** Tracks the content side's horizontal scroll as the time at the left edge of the timeline. */
export function useHorizontalScrollUpdate() {
  const { totalBounds, msPerPx } = injectTemporalDataContext()
  const { setCurrentPositionMs } = injectGanttStore()

  function onScroll(event: Event) {
    const scrolledPixels = getHorizontalScrolledPixels(event)

    setCurrentPositionMs(totalBounds.value.startMs + scrolledPixels * msPerPx.value)
  }

  return { onScroll }
}
