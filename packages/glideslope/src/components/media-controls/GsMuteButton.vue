<script setup lang="ts">
/**
 * Mutes or unmutes the media. It shows a muted icon whenever no sound plays, whether the media is
 * muted or its volume is at zero.
 *
 * @example
 * ```vue
 * <GsMediaController audio>
 *   <audio slot="media" src="/track.mp3" />
 *   <GsMuteButton />
 * </GsMediaController>
 * ```
 */
import SoundAudibleIcon from '@wingbrace/glideslope-icons/sound-audible'
import SoundMuteIcon from '@wingbrace/glideslope-icons/sound-mute'
import { MediaUIEvents, VolumeLevels } from 'media-chrome/dist/constants.js'
import { computed } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import { useMediaControlsDisabled } from './context'
import GsMediaButton from './GsMediaButton.vue'
import type { GsMuteButtonProps } from './types'
import { useMediaDispatch, useMediaSelector } from './use-media'

const { disabled = false } = defineProps<GsMuteButtonProps>()

const dispatch = useMediaDispatch()
const muted = useMediaSelector((state) => state.mediaMuted)
const volumeLevel = useMediaSelector((state) => state.mediaVolumeLevel)
const isDisabled = useMediaControlsDisabled(() => disabled)

/** Silent, either muted or at zero volume. */
const silent = computed(() => volumeLevel.value === VolumeLevels.OFF)

function toggle() {
  dispatch({
    type: muted.value ? MediaUIEvents.MEDIA_UNMUTE_REQUEST : MediaUIEvents.MEDIA_MUTE_REQUEST,
  })
}
</script>

<template>
  <GsMediaButton :label="silent ? 'Unmute' : 'Mute'" :disabled="isDisabled" @click="toggle">
    <GsIcon size="medium">
      <SoundMuteIcon v-if="silent" />
      <SoundAudibleIcon v-else />
    </GsIcon>
  </GsMediaButton>
</template>
