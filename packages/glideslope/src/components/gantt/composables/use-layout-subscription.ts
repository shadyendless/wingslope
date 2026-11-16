import { computed, onMounted, onScopeDispose, watch, type WatchSource } from 'vue'
import { injectGanttStore, type GanttState } from '../store'
import { keepIfEqual } from '../utils/equality'

export interface UseLayoutSubscriptionOptions<T> {
  /** Picks the store value the layout follows. It is compared shallowly, as with `zustand/shallow`. */
  selector: (state: GanttState) => T
  /** Writes the layout to the DOM. Runs in an animation frame, at most once per frame. */
  callback: (value: T) => void
  /**
   * The other reactive values the callback reads. A change re-applies the layout, as a new callback
   * (a `useCallback` with new dependencies) re-subscribed in the Design Toolkit.
   */
  sources?: WatchSource[]
}

/**
 * Applies a layout imperatively whenever a store value changes, outside Vue's rendering.
 *
 * The timeline and the current-time marker follow the horizontal scroll position on every frame.
 * Re-rendering them for that would patch every timeline chunk per frame, so, as in the Design
 * Toolkit, they subscribe to the store and write a CSS variable in an animation frame instead. The
 * layout is applied once the component has mounted (the Design Toolkit's `fireImmediately` in an
 * effect), then whenever the selected value or one of the `sources` changes. Call it in a
 * component's setup; nothing runs during server rendering.
 */
export function useLayoutSubscription<T>({
  selector,
  callback,
  sources = [],
}: UseLayoutSubscriptionOptions<T>) {
  const store = injectGanttStore()
  const selected = computed<T>((previous) => keepIfEqual(selector(store.state), previous))
  let animationFrameId = 0

  const scheduleLayout = () => {
    const value = selected.value

    cancelAnimationFrame(animationFrameId)
    animationFrameId = requestAnimationFrame(() => {
      callback(value)
    })
  }

  onMounted(scheduleLayout)
  watch([selected, ...sources], scheduleLayout, { flush: 'post' })

  onScopeDispose(() => {
    cancelAnimationFrame(animationFrameId)
  })
}
