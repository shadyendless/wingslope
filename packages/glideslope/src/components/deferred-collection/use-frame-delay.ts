import {
  getCurrentInstance,
  getCurrentScope,
  onMounted,
  onScopeDispose,
  readonly,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

export interface UseFrameDelayOptions {
  /** Number of animation frames to wait. A ref or getter restarts the wait while not ready. @default 2 */
  frames?: MaybeRefOrGetter<number | undefined>
  /** Called once the frames have passed. */
  onReady?: () => void
}

export interface UseFrameDelayReturn {
  /** Whether the frames have passed. */
  ready: Readonly<Ref<boolean>>
}

/**
 * Waits a number of animation frames, so the browser can paint a loading state before an expensive
 * render starts.
 *
 * In a component, the wait starts when it mounts (so not during server-side rendering) and stops
 * if it unmounts first.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { ready } = useFrameDelay({ frames: 3 })
 * </script>
 *
 * <template>
 *   <ExpensiveContent v-if="ready" />
 *   <LoadingState v-else />
 * </template>
 * ```
 */
export function useFrameDelay(options: UseFrameDelayOptions = {}): UseFrameDelayReturn {
  const ready = shallowRef(false)
  let frame: number | undefined

  function cancel() {
    if (frame !== undefined) cancelAnimationFrame(frame)
    frame = undefined
  }

  function start() {
    cancel()
    const frames = toValue(options.frames) ?? 2
    let count = 0
    const tick = () => {
      count++
      if (count >= frames) {
        frame = undefined
        ready.value = true
        options.onReady?.()
      } else {
        frame = requestAnimationFrame(tick)
      }
    }
    frame = requestAnimationFrame(tick)
  }

  if (getCurrentInstance()) onMounted(start)
  else if (typeof window !== 'undefined') start()

  watch(
    () => toValue(options.frames),
    () => {
      if (!ready.value) start()
    },
  )

  if (getCurrentScope()) onScopeDispose(cancel)

  return { ready: readonly(ready) }
}
