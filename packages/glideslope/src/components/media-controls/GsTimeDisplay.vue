<script setup lang="ts">
/**
 * Shows the playback time, the time remaining or the duration, using media-chrome's time
 * displays. Until the media's duration is known it shows `placeholder`.
 *
 * @example
 * ```vue
 * <GsTimeDisplay />
 * <GsTimeDisplay mode="remaining" />
 * <GsTimeDisplay mode="duration" placeholder="--:--" />
 * ```
 */
import { computed } from 'vue'
import { useMediaControlsDisabled } from './context'
import styles from './styles.module.css'
import type { GsTimeDisplayProps } from './types'
import { useMediaSelector } from './use-media'

const {
  mode = 'current',
  placeholder = 'hh:mm:ss',
  disabled = false,
} = defineProps<GsTimeDisplayProps>()

const duration = useMediaSelector((state) => state.mediaDuration)
const isDisabled = useMediaControlsDisabled(() => disabled)
const loaded = computed(() => duration.value != null && duration.value > 0)
</script>

<template>
  <div :class="styles.timeDisplay" :data-disabled="isDisabled ? '' : undefined">
    <span v-if="!loaded" :class="styles.timeDisplayText">{{ placeholder }}</span>
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -- a media-chrome custom element -->
    <media-duration-display v-else-if="mode === 'duration'" :class="styles.timeDisplayText" />
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -- a media-chrome custom element -->
    <media-time-display
      v-else
      :class="styles.timeDisplayText"
      :remaining.attr="mode === 'remaining' ? '' : undefined"
    />
  </div>
</template>
