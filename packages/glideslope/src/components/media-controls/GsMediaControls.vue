<script setup lang="ts">
/**
 * A bar of media controls. Lay out `GsPlayButton`, `GsTimeRange`, `GsMuteButton` and the other
 * controls inside it; `disabled` disables all of them. It must be inside a `GsMediaController`
 * (or `GsAudio` / `GsVideo`).
 *
 * @example
 * ```vue
 * <GsMediaControls>
 *   <GsSeekButton direction="backward" :seek-offset="15" />
 *   <GsPlayButton />
 *   <GsSeekButton direction="forward" :seek-offset="15" />
 *   <GsTimeDisplay mode="current" />
 *   <GsPlaybackRateButton :rates="[0.5, 1, 1.5, 2]" />
 * </GsMediaControls>
 * ```
 */
import { injectMediaStore, provideMediaControlsDisabled } from './context'
import styles from './styles.module.css'
import type { GsMediaControlsProps } from './types'

const { disabled = false } = defineProps<GsMediaControlsProps>()

defineSlots<{
  /** The media controls. */
  default?: () => unknown
}>()

injectMediaStore()
provideMediaControlsDisabled(() => disabled)
</script>

<template>
  <div
    :class="['group/media-controls', styles.mediaControls]"
    :data-disabled="disabled ? '' : undefined"
  >
    <slot />
  </div>
</template>
