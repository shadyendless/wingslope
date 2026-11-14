<script setup lang="ts">
/**
 * An audio player: an `<audio>` element with play and pause, seek buttons and bar, time,
 * volume and playback rate controls. Built on media-chrome, which also adds keyboard shortcuts
 * (Space plays and pauses, the arrow keys seek and change the volume, `m` mutes).
 *
 * If the audio fails to load, an error message replaces the title and the controls are disabled.
 * Put your own controls in the default slot to replace the layout.
 *
 * @example
 * ```vue
 * <GsAudio src="/track.mp3" title="Track.mp3" @ended="next" />
 *
 * <!-- Custom controls -->
 * <GsAudio src="/track.mp3">
 *   <GsMediaControls>
 *     <GsPlayButton />
 *     <GsTimeRange />
 *   </GsMediaControls>
 * </GsAudio>
 * ```
 */
import { formatError } from 'media-chrome/dist/labels/labels.js'
import { ref, watch } from 'vue'
import { provideMediaControlsDisabled } from '../media-controls/context'
import GsMediaController from '../media-controls/GsMediaController.vue'
import GsMuteButton from '../media-controls/GsMuteButton.vue'
import GsPlayButton from '../media-controls/GsPlayButton.vue'
import GsPlaybackRateButton from '../media-controls/GsPlaybackRateButton.vue'
import GsSeekButton from '../media-controls/GsSeekButton.vue'
import GsTimeDisplay from '../media-controls/GsTimeDisplay.vue'
import GsTimeRange from '../media-controls/GsTimeRange.vue'
import GsVolumeSlider from '../media-controls/GsVolumeSlider.vue'
import styles from './styles.module.css'
import type { GsAudioProps } from './types'

const {
  src,
  disabled = false,
  autoplay = false,
  loop = false,
  muted = false,
  preload = 'metadata',
  noHotkeys = false,
  noVolumePref = false,
  noMutedPref = false,
} = defineProps<GsAudioProps>()

const emit = defineEmits<{
  /** Playback reached the end (not emitted while looping). */
  ended: []
  /** The playback position changed, in seconds. */
  timeUpdate: [currentTime: number]
  /** The duration and other metadata are known. */
  loadedMetadata: [event: Event]
  /** Playback started or resumed. */
  play: [event: Event]
  /** Playback paused. */
  pause: [event: Event]
  /** The audio failed to load or play. */
  error: [error: MediaError]
}>()

defineSlots<{
  /** Your own controls, replacing the title, error message and default layout. */
  default?: () => unknown
}>()

/** The load error shown to the user; cleared when `src` changes. */
const errorMessage = ref('')
watch(
  () => src,
  () => {
    errorMessage.value = ''
  },
)

provideMediaControlsDisabled(() => disabled || errorMessage.value !== '')

function onTimeUpdate(event: Event) {
  const time = (event.currentTarget as HTMLMediaElement).currentTime
  if (Number.isFinite(time)) emit('timeUpdate', time)
}

function onError(event: Event) {
  const mediaError = (event.currentTarget as HTMLMediaElement).error
  errorMessage.value =
    (mediaError && formatError(mediaError)?.message) || 'Unable to load audio file'
  if (mediaError) emit('error', mediaError)
}
</script>

<template>
  <GsMediaController
    :class="['group/audio', styles.container]"
    audio
    :data-disabled="disabled ? '' : undefined"
    :no-hotkeys="noHotkeys"
    :hotkeys="hotkeys"
    :no-volume-pref="noVolumePref"
    :no-muted-pref="noMutedPref"
    :lang="lang"
  >
    <!-- eslint-disable vue/no-deprecated-slot-attribute -- media-chrome's `media` slot, not a Vue slot -->
    <audio
      slot="media"
      :class="styles.audio"
      :src="src"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :preload="preload"
      :crossorigin="crossorigin"
      @ended="emit('ended')"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="emit('loadedMetadata', $event)"
      @play="emit('play', $event)"
      @pause="emit('pause', $event)"
      @error="onError"
    />
    <!-- eslint-enable vue/no-deprecated-slot-attribute -->
    <slot>
      <div v-if="title" :class="[styles.titleRow, classes?.title]">{{ title }}</div>
      <div v-if="errorMessage" :class="styles.errorMessage" role="alert">{{ errorMessage }}</div>
      <div :class="[styles.controls, classes?.mediaControls]">
        <div :class="[styles.timeRow, classes?.timeRow]">
          <GsTimeDisplay mode="current" />
          <GsTimeRange />
          <GsTimeDisplay mode="duration" />
        </div>
        <div :class="[styles.controlsRow, classes?.controlsRow]">
          <div :class="styles.leftGroup">
            <div :class="styles.volumeGroup">
              <GsMuteButton />
              <GsVolumeSlider />
            </div>
          </div>
          <div :class="styles.playbackGroup">
            <GsSeekButton direction="backward" />
            <GsPlayButton />
            <GsSeekButton direction="forward" />
          </div>
          <div :class="styles.rightGroup">
            <GsPlaybackRateButton :rates="playbackRates" />
          </div>
        </div>
      </div>
    </slot>
  </GsMediaController>
</template>
