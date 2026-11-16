<script setup lang="ts">
/**
 * A closing bracket at a point in time, marking the end of a bracketed range.
 *
 * @example
 * ```vue
 * <GsGanttBracketOpen :time-ms="startMs" />
 * <GsGanttSpacer :start-time-ms="startMs" :end-time-ms="endMs" color="critical" />
 * <GsGanttBracketClose :time-ms="endMs" />
 * ```
 */
import GsGanttBracket from './GsGanttBracket.vue'
import type { GsGanttPointProps } from './types'

const { timeMs, color } = defineProps<GsGanttPointProps>()
</script>

<template>
  <GsGanttBracket direction="close" :time-ms="timeMs" :color="color" />
</template>
