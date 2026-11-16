<script setup lang="ts">
/**
 * A row of the side panel, usually the row's label. Pairs one-to-one, in order, with a
 * `GsGanttContentRow`. Rows have the chart's fixed `rowHeightPx` and don't grow with their
 * content.
 *
 * @example
 * ```vue
 * <GsGanttPanelRow>
 *   <span class="font-display text-body-s fg-primary-bold">KC-135</span>
 * </GsGanttPanelRow>
 * ```
 */
import styles from './styles.module.css'

defineSlots<{
  /** The row's label or other content. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles['panel-row']" role="listitem">
    <slot />
  </div>
</template>
