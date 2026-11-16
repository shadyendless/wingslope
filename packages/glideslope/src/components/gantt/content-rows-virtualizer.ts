/**
 * @internal The row virtualizer of `GsGanttContentContainer`. See `./rows-virtualizer.ts`. It is
 * as wide as the whole timeline, so the content side scrolls through it, and it reports
 * thresholds and keeps the scroll position when the range or scale changes.
 */
import { computed, defineComponent } from 'vue'
import { useScrollSync } from './composables/use-scroll-sync'
import { useTotalDataRegionThresholds } from './composables/use-total-data-region-thresholds'
import { injectGanttContext, injectTemporalDataContext } from './context'
import { useRowsVirtualizerRoot } from './rows-virtualizer'

export default defineComponent({
  name: 'GsGanttContentRowsVirtualizer',
  setup(_, { slots }) {
    const { ganttContentElement } = injectGanttContext()
    const { totalBounds, msPerPx } = injectTemporalDataContext()
    const width = computed(
      () => (totalBounds.value.endMs - totalBounds.value.startMs) / msPerPx.value,
    )
    const root = useRowsVirtualizerRoot()

    useTotalDataRegionThresholds({
      totalRowsCount: root.rowsCount,
      verticalScrollElement: ganttContentElement,
    })

    useScrollSync({ horizontalScrollElement: ganttContentElement })

    return () => root.render(slots.default?.() ?? [], { widthPx: width.value })
  },
})
