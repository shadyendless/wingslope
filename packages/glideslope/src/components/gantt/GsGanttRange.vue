<script setup lang="ts">
/**
 * @internal The base of the range elements (`GsGanttBlock`, `GsGanttSpacer`): rendered while it
 * overlaps the rendered region, positioned and sized along the timeline.
 */
import { computed } from 'vue'
import { useRangeElementLayout } from './composables/use-range-element-layout'
import { injectTemporalDataContext } from './context'
import { shouldRenderRangeElement } from './utils/helpers'
import type { GsGanttRangeProps } from './types'

const { startTimeMs, endTimeMs, color = 'accent' } = defineProps<GsGanttRangeProps>()

defineSlots<{
  default?: () => unknown
}>()

const { renderedRegionBounds } = injectTemporalDataContext()
const timeBounds = computed(() => ({ startMs: startTimeMs, endMs: endTimeMs }))
const rendered = computed(() =>
  shouldRenderRangeElement(renderedRegionBounds.value, timeBounds.value),
)
const layout = useRangeElementLayout({ timeBounds })
</script>

<template>
  <div v-if="rendered" :data-color="color" :style="layout">
    <slot />
  </div>
</template>
