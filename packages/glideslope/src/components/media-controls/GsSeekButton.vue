<script setup lang="ts">
/**
 * Seeks forward or backward by `seekOffset` seconds, stopping at the start and end of the media.
 * It is disabled until the media's duration is known.
 *
 * @example
 * ```vue
 * <GsSeekButton direction="backward" />
 * <GsSeekButton direction="forward" :seek-offset="30" />
 * ```
 */
import FastForwardIcon from '@wingbrace/glideslope-icons/fast-forward'
import FastRewindIcon from '@wingbrace/glideslope-icons/fast-rewind'
import { MediaUIEvents } from 'media-chrome/dist/constants.js'
import { computed, watch } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import { useMediaControlsDisabled } from './context'
import GsMediaButton from './GsMediaButton.vue'
import type { GsSeekButtonProps } from './types'
import { useMediaDispatch, useMediaSelector } from './use-media'

const { direction, seekOffset = 10, disabled = false } = defineProps<GsSeekButtonProps>()

const DEFAULT_SEEK_OFFSET = 10

const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0

const dispatch = useMediaDispatch()
const currentTime = useMediaSelector((state) => state.mediaCurrentTime)
const duration = useMediaSelector((state) => state.mediaDuration)
const disabledByParent = useMediaControlsDisabled(() => disabled)

const offset = computed(() => (isPositiveFinite(seekOffset) ? seekOffset : DEFAULT_SEEK_OFFSET))
watch(
  () => seekOffset,
  (value) => {
    if (!isPositiveFinite(value)) {
      console.warn(
        `[GsSeekButton] Invalid seekOffset "${value}", using the default (${DEFAULT_SEEK_OFFSET}).`,
      )
    }
  },
  { immediate: true },
)

/** Seeking needs a known duration and position. */
const loaded = computed(
  () => duration.value != null && duration.value > 0 && currentTime.value != null,
)
const isDisabled = computed(() => disabledByParent.value || !loaded.value)

function seek() {
  if (currentTime.value == null || duration.value == null) return
  const delta = direction === 'forward' ? offset.value : -offset.value
  const target = Math.max(0, Math.min(duration.value, currentTime.value + delta))
  dispatch({ type: MediaUIEvents.MEDIA_SEEK_REQUEST, detail: target })
}
</script>

<template>
  <GsMediaButton
    :label="`Seek ${direction} ${offset} seconds`"
    :disabled="isDisabled"
    @click="seek"
  >
    <GsIcon size="medium">
      <FastForwardIcon v-if="direction === 'forward'" />
      <FastRewindIcon v-else />
    </GsIcon>
  </GsMediaButton>
</template>
