<script setup lang="ts">
/**
 * @internal The base of `GsGanttBracketOpen` and `GsGanttBracketClose`: a bracket at a point in
 * time, facing right (open) or left (close). Muted once the current time has passed it.
 */
import { useIsElapsed } from './composables/use-is-elapsed'
import GsGanttPoint from './GsGanttPoint.vue'
import styles from './styles.module.css'
import type { GsGanttPointProps } from './types'

const { direction, timeMs, color } = defineProps<
  GsGanttPointProps & {
    /** `open` starts a bracketed range; `close` ends it. */
    direction: 'open' | 'close'
  }
>()

const elapsed = useIsElapsed(() => timeMs)
</script>

<template>
  <GsGanttPoint
    :time-ms="timeMs"
    :color="color"
    :class="styles.bracket"
    :data-direction="direction"
    :data-elapsed="elapsed || undefined"
  >
    <div :class="styles['bracket-line']" />
  </GsGanttPoint>
</template>
