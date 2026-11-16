<script setup lang="ts">
/**
 * A time range drawn as a thin horizontal line, typically connecting other elements. The part
 * before the current time is drawn as elapsed.
 *
 * @example
 * ```vue
 * <GsGanttSpacer :start-time-ms="startMs" :end-time-ms="endMs" color="critical" />
 * ```
 */
import { useElapsedPercentage } from './composables/use-elapsed-percentage'
import GsGanttRange from './GsGanttRange.vue'
import styles from './styles.module.css'
import type { GsGanttRangeProps } from './types'

const { startTimeMs, endTimeMs, color } = defineProps<GsGanttRangeProps>()

const elapsedPct = useElapsedPercentage(() => ({ startMs: startTimeMs, endMs: endTimeMs }))
</script>

<template>
  <GsGanttRange
    :start-time-ms="startTimeMs"
    :end-time-ms="endTimeMs"
    :color="color"
    :class="styles.spacer"
    :style="{ '--elapsed-pct': `${elapsedPct}%` }"
  />
</template>
