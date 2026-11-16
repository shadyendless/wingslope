<script setup lang="ts">
/**
 * A row of the timeline, holding its elements: `GsGanttBlock`, `GsGanttSpacer`, `GsGanttMarker`,
 * `GsGanttIconMarker`, `GsGanttBracketOpen` and `GsGanttBracketClose`. Pairs one-to-one, in
 * order, with a `GsGanttPanelRow`. Only the elements in the rendered time region are rendered.
 *
 * @example
 * ```vue
 * <GsGanttContentRow>
 *   <GsGanttBlock :start-time-ms="startMs" :end-time-ms="endMs" color="serious" />
 *   <GsGanttMarker :time-ms="markerMs" />
 * </GsGanttContentRow>
 * ```
 */
import styles from './styles.module.css'

defineSlots<{
  /** The row's timeline elements. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles['content-row']">
    <slot />
  </div>
</template>
