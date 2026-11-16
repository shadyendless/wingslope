<script setup lang="ts">
/**
 * The scrollable timeline of a `GsGantt`: a timeline header with the current time, above one
 * `GsGanttContentRow` per row. Place it beside a `GsGanttPanelContainer` with the same rows in the
 * same order. It scrolls horizontally through the chart's time range; only the rows and timeline
 * chunks in view are rendered.
 *
 * @example
 * ```vue
 * <GsGanttContentContainer>
 *   <GsGanttContentRow v-for="row in rows" :key="row.id">
 *     <GsGanttBlock :start-time-ms="row.startMs" :end-time-ms="row.endMs" />
 *   </GsGanttContentRow>
 * </GsGanttContentContainer>
 * ```
 */
import { useHorizontalScrollUpdate } from './composables/use-horizontal-scroll-update'
import { elementRef, injectGanttContext, injectTemporalDataContext } from './context'
import GsGanttCurrentTime from './GsGanttCurrentTime.vue'
import GsGanttTimeline from './GsGanttTimeline.vue'
import ContentRowsVirtualizer from './content-rows-virtualizer'
import styles from './styles.module.css'

defineSlots<{
  /** The `GsGanttContentRow`s, one per row. */
  default?: () => unknown
}>()

const { ganttContentElement, headerElement } = injectGanttContext()
const { currentTimeMs } = injectTemporalDataContext()
const { onScroll } = useHorizontalScrollUpdate()
const setContentElement = elementRef(ganttContentElement)
const setHeaderElement = elementRef(headerElement)
</script>

<template>
  <div
    :ref="setContentElement"
    role="group"
    aria-label="Timeline"
    tabindex="0"
    :class="styles.content"
    @scroll.passive="onScroll"
  >
    <div :ref="setHeaderElement" :class="styles.header">
      <GsGanttCurrentTime v-if="currentTimeMs" :current-time-ms="currentTimeMs" />
      <GsGanttTimeline />
    </div>
    <ContentRowsVirtualizer>
      <slot />
    </ContentRowsVirtualizer>
  </div>
</template>
