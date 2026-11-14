<script setup lang="ts">
/**
 * Shows the playback rate (`1x`, `2x`, …) and moves to the next rate in `rates` on each press,
 * wrapping around after the last.
 *
 * @example
 * ```vue
 * <GsPlaybackRateButton :rates="[0.5, 1, 1.5, 2]" />
 * ```
 */
import { MediaUIEvents } from 'media-chrome/dist/constants.js'
import { computed, watch } from 'vue'
import { useMediaControlsDisabled } from './context'
import GsMediaButton from './GsMediaButton.vue'
import styles from './styles.module.css'
import type { GsPlaybackRateButtonProps } from './types'
import { useMediaDispatch, useMediaSelector } from './use-media'

const { rates, disabled = false } = defineProps<GsPlaybackRateButtonProps>()

const DEFAULT_RATES = [1, 2, 3]

const isValidRate = (rate: number) => Number.isFinite(rate) && rate > 0

const dispatch = useMediaDispatch()
const rate = useMediaSelector((state) => state.mediaPlaybackRate ?? 1)
const isDisabled = useMediaControlsDisabled(() => disabled)

const validRates = computed(() => (rates ?? DEFAULT_RATES).filter(isValidRate))
const safeRates = computed(() => (validRates.value.length > 0 ? validRates.value : DEFAULT_RATES))
watch(
  () => rates,
  (value) => {
    if (value?.length && !value.some(isValidRate)) {
      console.warn(
        `[GsPlaybackRateButton] Invalid rates provided, using the defaults [${DEFAULT_RATES.join(', ')}].`,
      )
    }
  },
  { immediate: true },
)

const displayRate = computed(() => (isValidRate(rate.value) ? rate.value : safeRates.value[0]))

function next() {
  const options = safeRates.value
  const index = options.indexOf(rate.value)
  dispatch({
    type: MediaUIEvents.MEDIA_PLAYBACK_RATE_REQUEST,
    detail: options[(index + 1) % options.length],
  })
}
</script>

<template>
  <GsMediaButton :label="`Playback rate ${displayRate}x`" :disabled="isDisabled" @click="next">
    <span :class="styles.playbackRateText">{{ displayRate }}x</span>
  </GsMediaButton>
</template>
