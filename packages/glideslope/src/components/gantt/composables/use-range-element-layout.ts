import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { injectTemporalDataContext } from '../context'
import { deriveRangeElementLayout } from '../utils/layout'
import type { GsGanttTimeBounds } from '../types'

export interface UseRangeElementLayoutOptions {
  timeBounds: MaybeRefOrGetter<GsGanttTimeBounds>
}

/**
 * The position and width of a range element (block or spacer), as CSS variables, clipped to the
 * rendered region.
 *
 * The Design Toolkit writes these to the element in a store subscription, to avoid re-rendering.
 * They only change with the rendered region, the scale or the element's own times, never with
 * every scroll frame, so here they are a computed style: only this element's style is patched,
 * and it is in place on the first paint.
 */
export function useRangeElementLayout({
  timeBounds,
}: UseRangeElementLayoutOptions): ComputedRef<Record<string, string>> {
  const { renderedRegionBounds, msPerPx, totalBounds } = injectTemporalDataContext()

  return computed(() => {
    const { widthPx, translateX } = deriveRangeElementLayout(
      renderedRegionBounds.value,
      toValue(timeBounds),
      totalBounds.value,
      msPerPx.value,
    )

    return { '--translate-x': `${translateX}px`, '--width': `${widthPx}px` }
  })
}
