import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { injectTemporalDataContext } from '../context'
import type { GsGanttTimeBounds } from '../types'

/** How much of a range element's rendered part is before the current time, from 0 to 100. */
export function useElapsedPercentage(
  bounds: MaybeRefOrGetter<GsGanttTimeBounds>,
): ComputedRef<number> {
  const { currentTimeMs, renderedRegionBounds } = injectTemporalDataContext()

  return computed(() => {
    const { startMs: elementStartMs, endMs: elementEndMs } = toValue(bounds)
    const startMs = Math.max(elementStartMs, renderedRegionBounds.value.startMs)
    const endMs = Math.min(elementEndMs, renderedRegionBounds.value.endMs)

    const totalDuration = endMs - startMs
    if (totalDuration <= 0) {
      return 0
    }

    const elapsed = Math.max(0, Math.min(currentTimeMs.value - startMs, totalDuration))
    return (elapsed / totalDuration) * 100
  })
}
