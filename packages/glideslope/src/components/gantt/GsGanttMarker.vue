<script setup lang="ts">
/**
 * A single point in time, drawn as a vertical line with a dot. Muted once the current time has
 * passed it.
 *
 * @example
 * ```vue
 * <GsGanttMarker :time-ms="timeMs" color="serious" />
 * ```
 */
import { useIsElapsed } from './composables/use-is-elapsed'
import GsGanttPoint from './GsGanttPoint.vue'
import styles from './styles.module.css'
import type { GsGanttPointProps } from './types'

const { timeMs, color } = defineProps<GsGanttPointProps>()

const elapsed = useIsElapsed(() => timeMs)
</script>

<template>
  <GsGanttPoint
    :time-ms="timeMs"
    :color="color"
    :class="styles.marker"
    :data-elapsed="elapsed || undefined"
  >
    <div :class="styles['marker-point']" />
  </GsGanttPoint>
</template>
