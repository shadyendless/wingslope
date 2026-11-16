<script setup lang="ts">
/**
 * An opening bracket at a point in time, marking the start of a bracketed range.
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
  <GsGanttBracket direction="open" :time-ms="timeMs" :color="color" />
</template>
