<script setup lang="ts">
/**
 * @internal The base of the point elements (markers and brackets): rendered while its time is in
 * the rendered region, positioned along the timeline.
 */
import { computed } from 'vue'
import { usePointElementLayout } from './composables/use-point-element-layout'
import { injectTemporalDataContext } from './context'
import { timestampWithinBounds } from './utils/helpers'
import type { GsGanttPointProps } from './types'

const { timeMs, color = 'accent' } = defineProps<GsGanttPointProps>()

defineSlots<{
  default?: () => unknown
}>()

const { renderedRegionBounds } = injectTemporalDataContext()
const rendered = computed(() => timestampWithinBounds(timeMs, renderedRegionBounds.value))
const layout = usePointElementLayout({ timeMs: () => timeMs })
</script>

<template>
  <div v-if="rendered" :data-color="color" :style="layout">
    <slot />
  </div>
</template>
