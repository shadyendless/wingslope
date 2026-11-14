<script setup lang="ts">
/**
 * A seek bar: media-chrome's time range, styled for Glideslope. It shows the playback position
 * and buffered range, and the time under the pointer while hovered. Arrow keys seek.
 *
 * @example
 * ```vue
 * <GsTimeRange />
 * ```
 */
import { useMediaControlsDisabled } from './context'
import styles from './styles.module.css'
import type { GsTimeRangeProps } from './types'

const { disabled = false } = defineProps<GsTimeRangeProps>()

const isDisabled = useMediaControlsDisabled(() => disabled)
</script>

<template>
  <div :class="styles.timeRange">
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -- a media-chrome custom element -->
    <media-time-range
      :class="['group/time-range', styles.timeRangeInput]"
      aria-label="Seek"
      :disabled.attr="isDisabled ? '' : undefined"
      :data-disabled="isDisabled ? '' : undefined"
    >
      <!-- eslint-disable vue/component-name-in-template-casing, vue/no-deprecated-slot-attribute -- a media-chrome custom element in its parent's `current` slot -->
      <media-time-display slot="current" :class="styles.currentTimeDisplay" />
      <!-- eslint-enable vue/component-name-in-template-casing, vue/no-deprecated-slot-attribute -->
    </media-time-range>
  </div>
</template>
