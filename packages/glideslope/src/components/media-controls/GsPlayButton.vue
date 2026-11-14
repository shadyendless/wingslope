<script setup lang="ts">
/**
 * Plays or pauses the media. It shows a play icon while the media is paused and a pause icon
 * while it plays, and its label says what a press does.
 *
 * @example
 * ```vue
 * <GsMediaController audio>
 *   <audio slot="media" src="/track.mp3" />
 *   <GsPlayButton />
 * </GsMediaController>
 * ```
 */
import PauseIcon from '@wingbrace/glideslope-icons/pause'
import PlayIcon from '@wingbrace/glideslope-icons/play'
import { MediaUIEvents } from 'media-chrome/dist/constants.js'
import GsIcon from '../icon/GsIcon.vue'
import { useMediaControlsDisabled } from './context'
import GsMediaButton from './GsMediaButton.vue'
import type { GsPlayButtonProps } from './types'
import { useMediaDispatch, useMediaSelector } from './use-media'

const { disabled = false } = defineProps<GsPlayButtonProps>()

const dispatch = useMediaDispatch()
const paused = useMediaSelector((state) => state.mediaPaused ?? true)
const isDisabled = useMediaControlsDisabled(() => disabled)

function toggle() {
  dispatch({
    type: paused.value ? MediaUIEvents.MEDIA_PLAY_REQUEST : MediaUIEvents.MEDIA_PAUSE_REQUEST,
  })
}
</script>

<template>
  <GsMediaButton :label="paused ? 'Play' : 'Pause'" :disabled="isDisabled" @click="toggle">
    <GsIcon size="medium">
      <PlayIcon v-if="paused" />
      <PauseIcon v-else />
    </GsIcon>
  </GsMediaButton>
</template>
