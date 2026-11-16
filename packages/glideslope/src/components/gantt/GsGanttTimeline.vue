<script setup lang="ts">
/**
 * @internal The timeline in the content header: a labelled chunk per timescale interval, rendered
 * around the scroll position and slid with it every frame.
 */
import { useTemplateRef } from 'vue'
import { useTimelineTransform } from './composables/use-timeline-transform'
import { injectTemporalDataContext } from './context'
import styles from './styles.module.css'
import { formatTimestampLabel } from './utils/formatting'

const { msPerPx, timelineChunks } = injectTemporalDataContext()
const timelineElement = useTemplateRef<HTMLDivElement>('timeline')

useTimelineTransform({ timelineElement, msPerPx, timelineChunks })
</script>

<template>
  <div :class="styles['timeline-container']">
    <div ref="timeline" :class="styles.timeline">
      <div
        v-for="chunk in timelineChunks"
        :key="chunk.timestampMs"
        :class="styles.chunk"
        :data-timestamp="chunk.timestampMs"
      >
        <div :class="styles['chunk-label']">{{ formatTimestampLabel(chunk.timestampMs) }}</div>
        <div :class="styles['chunk-ticks']" aria-hidden="true">
          <div :class="styles['chunk-tick-container']"><span :class="styles['chunk-tick']" /></div>
          <div :class="styles['chunk-tick-container']"><span :class="styles['chunk-tick']" /></div>
        </div>
      </div>
    </div>
  </div>
</template>
