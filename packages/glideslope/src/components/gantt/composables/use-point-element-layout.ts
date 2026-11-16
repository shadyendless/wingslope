import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { injectTemporalDataContext } from '../context'
import { derivePointElementLayout } from '../utils/layout'

export interface UsePointElementLayoutOptions {
  timeMs: MaybeRefOrGetter<number>
}

/**
 * The position of a point element (marker or bracket), as a CSS variable. A computed style, for
 * the reasons given in `useRangeElementLayout`.
 */
export function usePointElementLayout({
  timeMs,
}: UsePointElementLayoutOptions): ComputedRef<Record<string, string>> {
  const { renderedRegionBounds, msPerPx, totalBounds } = injectTemporalDataContext()

  return computed(() => {
    const { translateX } = derivePointElementLayout(
      renderedRegionBounds.value,
      toValue(timeMs),
      totalBounds.value,
      msPerPx.value,
    )

    return { '--translate-x': `${translateX}px` }
  })
}
