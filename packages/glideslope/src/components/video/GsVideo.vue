<script setup lang="ts">
/**
 * A video player: a `<video>` element with play and pause, seek buttons and bar, time, volume,
 * playback rate and fullscreen controls below it. Built on media-chrome, which also adds keyboard
 * shortcuts (Space plays and pauses, the arrow keys seek and change the volume, `m` mutes, `f`
 * toggles fullscreen).
 *
 * An overlay shows while the video loads or buffers. If it fails to load, an error overlay
 * replaces it and the controls are disabled. Put your own controls in the default slot to replace
 * the layout.
 *
 * @example
 * ```vue
 * <GsVideo src="/clip.mp4" poster="/clip.jpg" @ended="next" />
 *
 * <!-- Custom controls -->
 * <GsVideo src="/clip.mp4">
 *   <GsMediaControls>
 *     <GsPlayButton />
 *     <GsTimeRange />
 *     <GsFullscreenButton />
 *   </GsMediaControls>
 * </GsVideo>
 * ```
 */
import { formatError } from 'media-chrome/dist/labels/labels.js'
import { ref, watch } from 'vue'
import { provideMediaControlsDisabled } from '../media-controls/context'
import GsFullscreenButton from '../media-controls/GsFullscreenButton.vue'
import GsMediaController from '../media-controls/GsMediaController.vue'
import GsMuteButton from '../media-controls/GsMuteButton.vue'
import GsPlayButton from '../media-controls/GsPlayButton.vue'
import GsPlaybackRateButton from '../media-controls/GsPlaybackRateButton.vue'
import GsSeekButton from '../media-controls/GsSeekButton.vue'
import GsTimeDisplay from '../media-controls/GsTimeDisplay.vue'
import GsTimeRange from '../media-controls/GsTimeRange.vue'
import GsVolumeSlider from '../media-controls/GsVolumeSlider.vue'
import GsVideoStatus from './GsVideoStatus.vue'
import styles from './styles.module.css'
import type { GsVideoProps } from './types'

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
} = defineProps<GsVideoProps>()

const emit = defineEmits<{
  /** Playback reached the end (not emitted while looping). */
  ended: []
  /** The playback position changed, in seconds. */
  timeUpdate: [currentTime: number]
  /** The duration, dimensions and other metadata are known. */
  loadedMetadata: [event: Event]
  /** Playback started or resumed. */
  play: [event: Event]
  /** Playback paused. */
  pause: [event: Event]
  /** The video failed to load or play. */
  error: [error: MediaError]
}>()

defineSlots<{
  /** Your own controls, replacing the default layout. The loading and error overlays remain. */
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
    (mediaError && formatError(mediaError)?.message) || 'Unable to load video file'
  if (mediaError) emit('error', mediaError)
}
</script>

<template>
  <GsMediaController
    :class="['group/video', styles.container]"
    :data-disabled="disabled ? '' : undefined"
    :no-hotkeys="noHotkeys"
    :hotkeys="hotkeys"
    :no-volume-pref="noVolumePref"
    :no-muted-pref="noMutedPref"
    :lang="lang"
  >
    <!-- eslint-disable vue/no-deprecated-slot-attribute -- media-chrome's `media` slot, not a Vue slot -->
    <video
      slot="media"
      :class="[styles.video, classes?.video]"
      :src="src"
      :poster="poster"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :preload="preload"
      :crossorigin="crossorigin"
      playsinline
      @ended="emit('ended')"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="emit('loadedMetadata', $event)"
      @play="emit('play', $event)"
      @pause="emit('pause', $event)"
      @error="onError"
    />
    <!-- eslint-enable vue/no-deprecated-slot-attribute -->
    <GsVideoStatus :error="errorMessage" />
    <slot>
      <!-- `noautohide` keeps media-chrome from hiding the controls while the video plays. -->
      <div :class="styles.controlsOverlay" noautohide>
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
              <GsFullscreenButton />
            </div>
          </div>
        </div>
      </div>
    </slot>
  </GsMediaController>
</template>
