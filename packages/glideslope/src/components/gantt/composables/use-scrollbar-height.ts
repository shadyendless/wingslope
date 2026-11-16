import { shallowRef, watch, type Ref } from 'vue'
import { injectGanttContext } from '../context'

/** Height of the content side's horizontal scrollbar, in pixels. */
export function useScrollbarHeight(): Readonly<Ref<number>> {
  const { ganttContentElement } = injectGanttContext()
  const scrollbarHeight = shallowRef(0)

  watch(
    ganttContentElement,
    (element, _, onCleanup) => {
      if (!element) {
        return
      }

      const calculateScrollbarHeight = () => {
        scrollbarHeight.value = element.offsetHeight - element.clientHeight
      }

      // Calculate on mount
      calculateScrollbarHeight()

      // Recalculate when the element resizes. Its height can change after a render, and nothing
      // this composable reads would tell it so.
      const resizeObserver = new ResizeObserver(calculateScrollbarHeight)
      resizeObserver.observe(element)

      onCleanup(() => {
        resizeObserver.disconnect()
      })
    },
    { immediate: true },
  )

  return scrollbarHeight
}
