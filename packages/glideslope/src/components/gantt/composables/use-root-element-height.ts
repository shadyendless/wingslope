import { shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { injectGanttContext } from '../context'

/**
 * Measures an element's `clientHeight` when it mounts and again whenever it resizes. Used once
 * per chart, by `GsGantt`, for its root element.
 */
export function useClientHeight(
  element: MaybeRefOrGetter<HTMLElement | null>,
): Readonly<Ref<number>> {
  const height = shallowRef(0)

  watch(
    () => toValue(element),
    (el, _, onCleanup) => {
      if (!el) {
        height.value = 0
        return
      }

      height.value = el.clientHeight

      const resizeObserver = new ResizeObserver(() => {
        height.value = el.clientHeight
      })
      resizeObserver.observe(el)

      onCleanup(() => {
        resizeObserver.disconnect()
      })
    },
    { immediate: true },
  )

  return height
}

/**
 * The chart root's client height: the height of the visible region.
 *
 * The Design Toolkit reads `rootElement.clientHeight` during each render. Here `GsGantt` measures
 * it once (see `useClientHeight`) and every part reads the shared value.
 */
export function useRootElementHeight(): Readonly<Ref<number>> {
  return injectGanttContext().rootElementHeight
}
