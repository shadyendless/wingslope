import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import { injectTemporalDataContext } from '../context'

/** Whether a point element is at or before the current time. */
export function useIsElapsed(timeMs: MaybeRefOrGetter<number | undefined>): ComputedRef<boolean> {
  const { currentTimeMs } = injectTemporalDataContext()

  return computed(() => {
    const value = toValue(timeMs)
    return value !== undefined && value <= currentTimeMs.value
  })
}
