<script setup lang="ts">
/**
 * The fixed-width side panel of a `GsGantt`, holding one `GsGanttPanelRow` per row (usually the
 * row's label). Place it beside a `GsGanttContentContainer` with the same rows in the same order.
 * Only the rows in view are rendered.
 *
 * @example
 * ```vue
 * <GsGanttPanelContainer>
 *   <GsGanttPanelRow v-for="row in rows" :key="row.id">{{ row.name }}</GsGanttPanelRow>
 * </GsGanttPanelContainer>
 * ```
 */
import { elementRef, injectGanttContext } from './context'
import PanelRowsVirtualizer from './panel-rows-virtualizer'
import styles from './styles.module.css'

defineSlots<{
  /** The `GsGanttPanelRow`s, one per row. */
  default?: () => unknown
}>()

const { ganttPanelElement } = injectGanttContext()
const setPanelElement = elementRef(ganttPanelElement)
</script>

<template>
  <div :ref="setPanelElement" :class="styles.panel">
    <div :class="styles.header" />
    <PanelRowsVirtualizer>
      <slot />
    </PanelRowsVirtualizer>
  </div>
</template>
