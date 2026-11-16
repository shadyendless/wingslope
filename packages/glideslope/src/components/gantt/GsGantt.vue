<script setup lang="ts">
/**
 * A timeline chart of time-based events and intervals, virtualized along both axes.
 *
 * `GsGantt` holds a `GsGanttPanelContainer` (a fixed-width column of row labels) beside a
 * `GsGanttContentContainer` (the scrollable timeline). Each has one row per data row, in the same
 * order: `GsGanttPanelRow`s and `GsGanttContentRow`s. Content rows hold the timeline elements:
 * `GsGanttBlock`, `GsGanttSpacer`, `GsGanttMarker`, `GsGanttIconMarker`, `GsGanttBracketOpen`
 * and `GsGanttBracketClose`. The chart fills its container's height.
 *
 * @example
 * ```vue
 * <div class="h-[480px]">
 *   <GsGantt :start-time-ms="startMs" :end-time-ms="endMs" timescale="1h" :current-time-ms="now">
 *     <GsGanttPanelContainer>
 *       <GsGanttPanelRow v-for="row in rows" :key="row.id">{{ row.name }}</GsGanttPanelRow>
 *     </GsGanttPanelContainer>
 *     <GsGanttContentContainer>
 *       <GsGanttContentRow v-for="row in rows" :key="row.id">
 *         <GsGanttBlock :start-time-ms="row.startMs" :end-time-ms="row.endMs" />
 *       </GsGanttContentRow>
 *     </GsGanttContentContainer>
 *   </GsGantt>
 * </div>
 * ```
 */
import { computed, shallowRef } from 'vue'
import { useClientHeight } from './composables/use-root-element-height'
import { useTemporalData } from './composables/use-temporal-data'
import { GANTT_ROW_HEIGHT_PX } from './constants'
import { provideGanttContext, provideTemporalDataContext } from './context'
import GsGanttRootContainer from './GsGanttRootContainer.vue'
import { createGanttStore, provideGanttStore } from './store'
import type { GsGanttMetThresholdData, GsGanttProps } from './types'

const {
  startTimeMs,
  endTimeMs,
  timescale = '1h',
  currentTimeMs,
  threshold,
  rowHeightPx = GANTT_ROW_HEIGHT_PX,
} = defineProps<GsGanttProps>()

const emit = defineEmits<{
  /**
   * The rendered region entered one or more thresholds set by `threshold`: it is near the start or
   * end of the time range, or of the rows. Only newly met thresholds are reported; one that stays
   * met is reported again only after it is left and re-entered, or when its value changes.
   */
  thresholdMet: [metThresholds: GsGanttMetThresholdData[]]
}>()

defineSlots<{
  /** A `GsGanttPanelContainer` and a `GsGanttContentContainer`. */
  default?: () => unknown
}>()

const rootElement = shallowRef<HTMLDivElement | null>(null)
const headerElement = shallowRef<HTMLDivElement | null>(null)
const ganttContentElement = shallowRef<HTMLDivElement | null>(null)
const ganttPanelElement = shallowRef<HTMLDivElement | null>(null)

// Starts at the middle of the total range, so the start threshold isn't met on mount. Later range
// changes keep the position when they can (see `useScrollSync`).
const store = createGanttStore({ startTimeMs: startTimeMs + (endTimeMs - startTimeMs) / 2 })
provideGanttStore(store)

provideGanttContext({
  rootElement,
  headerElement,
  ganttContentElement,
  ganttPanelElement,
  rowHeightPx: computed(() => rowHeightPx),
  rootElementHeight: useClientHeight(rootElement),
})

provideTemporalDataContext(
  useTemporalData({
    store,
    headerElement,
    timescale: () => timescale,
    totalBounds: () => ({ startMs: startTimeMs, endMs: endTimeMs }),
    threshold: () => threshold,
    currentTimeMs: () => currentTimeMs,
    onThresholdMet: (metThresholds) => emit('thresholdMet', metThresholds),
  }),
)
</script>

<template>
  <GsGanttRootContainer>
    <slot />
  </GsGanttRootContainer>
</template>
