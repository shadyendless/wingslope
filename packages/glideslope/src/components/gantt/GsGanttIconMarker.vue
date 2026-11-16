<script setup lang="ts">
/**
 * A single point in time, drawn as a vertical line with an icon in a ring. Put a `GsIcon` in the
 * default slot; it is scaled to fit the ring. Muted once the current time has passed it.
 *
 * @example
 * ```vue
 * <GsGanttIconMarker :time-ms="timeMs" color="serious">
 *   <GsIcon size="small"><PlaceholderIcon /></GsIcon>
 * </GsGanttIconMarker>
 * ```
 */
import { useIsElapsed } from './composables/use-is-elapsed'
import GsGanttPoint from './GsGanttPoint.vue'
import { provideIconDefaults } from '../icon/defaults'
import styles from './styles.module.css'
import type { GsGanttPointProps } from './types'

const { timeMs, color = 'accent' } = defineProps<GsGanttPointProps>()

defineSlots<{
  /** The icon: a `GsIcon`. */
  default?: () => unknown
}>()

const elapsed = useIsElapsed(() => timeMs)

provideIconDefaults({ class: styles['marker-icon-glyph'] })
</script>

<template>
  <GsGanttPoint
    :time-ms="timeMs"
    :color="color"
    :class="styles.marker"
    :data-elapsed="elapsed || undefined"
  >
    <span :class="styles['marker-icon']" :data-color="color" :data-elapsed="elapsed || undefined">
      <slot />
    </span>
  </GsGanttPoint>
</template>
