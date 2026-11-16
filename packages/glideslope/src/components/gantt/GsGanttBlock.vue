<script setup lang="ts">
/**
 * A time range drawn as a filled bar, which may hold content (it is clipped to the row's height).
 * The part before the current time is drawn as elapsed.
 *
 * @example
 * ```vue
 * <GsGanttBlock :start-time-ms="startMs" :end-time-ms="endMs" color="serious">
 *   <span class="text-body-xs">MISSION ENTRY</span>
 * </GsGanttBlock>
 * ```
 */
import { useElapsedPercentage } from './composables/use-elapsed-percentage'
import GsGanttRange from './GsGanttRange.vue'
import styles from './styles.module.css'
import type { GsGanttRangeProps } from './types'

const { startTimeMs, endTimeMs, color } = defineProps<GsGanttRangeProps>()

defineSlots<{
  /** Content shown in the bar. */
  default?: () => unknown
}>()

const elapsedPct = useElapsedPercentage(() => ({ startMs: startTimeMs, endMs: endTimeMs }))
</script>

<template>
  <GsGanttRange
    :start-time-ms="startTimeMs"
    :end-time-ms="endTimeMs"
    :color="color"
    :class="styles.block"
    :style="{ '--elapsed-pct': `${elapsedPct}%` }"
  >
    <slot />
  </GsGanttRange>
</template>
