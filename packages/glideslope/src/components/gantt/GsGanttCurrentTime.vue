<script setup lang="ts">
/**
 * @internal The current-time marker in the content header: a label and a dashed line down the
 * rows, shown while the current time is in the rendered region.
 */
import { computed, useTemplateRef } from 'vue'
import { useCurrentTimeLayout } from './composables/use-current-time-layout'
import { injectTemporalDataContext } from './context'
import styles from './styles.module.css'
import { formatTimestampLabel } from './utils/formatting'
import { shouldRenderCurrentTime } from './utils/helpers'

const { currentTimeMs } = defineProps<{
  /** The current time, in epoch milliseconds. */
  currentTimeMs: number
}>()

const { renderedRegionBounds } = injectTemporalDataContext()
const shouldDisplayCurrentTime = computed(() =>
  shouldRenderCurrentTime(currentTimeMs, renderedRegionBounds.value),
)
const labelText = computed(() => formatTimestampLabel(currentTimeMs))

useCurrentTimeLayout({
  currentTimeElement: useTemplateRef<HTMLDivElement>('marker'),
  currentTimeMs: () => currentTimeMs,
  labelElement: useTemplateRef<HTMLDivElement>('label'),
  indicatorElement: useTemplateRef<HTMLDivElement>('indicator'),
})
</script>

<template>
  <div v-if="shouldDisplayCurrentTime" ref="marker" :class="styles['current-time']">
    <div ref="label" :class="styles['current-time-label']">
      <span>{{ labelText }}</span>
    </div>
    <div ref="indicator" :class="styles['current-time-indicator']" />
  </div>
</template>
