<script setup lang="ts">
/**
 * A volume slider: media-chrome's volume range, styled for Glideslope. Arrow keys change the
 * volume.
 *
 * @example
 * ```vue
 * <GsVolumeSlider show-label />
 * ```
 */
import { useMediaControlsDisabled } from './context'
import styles from './styles.module.css'
import type { GsVolumeSliderProps } from './types'

const { showLabel = false, disabled = false } = defineProps<GsVolumeSliderProps>()

const isDisabled = useMediaControlsDisabled(() => disabled)
</script>

<template>
  <div :class="styles.volumeSlider" :data-disabled="isDisabled ? '' : undefined">
    <span v-if="showLabel" :class="styles.volumeLabel">Volume</span>
    <!-- eslint-disable-next-line vue/component-name-in-template-casing -- a media-chrome custom element -->
    <media-volume-range
      :class="styles.volumeRange"
      aria-label="Volume"
      :disabled.attr="isDisabled ? '' : undefined"
      :data-disabled="isDisabled ? '' : undefined"
    />
  </div>
</template>
