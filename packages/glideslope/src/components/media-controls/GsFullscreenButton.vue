<script setup lang="ts">
/**
 * Enters or exits fullscreen. The controller (`GsVideo`'s root) is the element that goes
 * fullscreen, so the controls stay visible.
 *
 * @example
 * ```vue
 * <GsVideo src="/clip.mp4">
 *   <GsMediaControls>
 *     <GsPlayButton />
 *     <GsFullscreenButton />
 *   </GsMediaControls>
 * </GsVideo>
 * ```
 */
import CollapseWindowIcon from '@wingbrace/glideslope-icons/collapse-window'
import FullScreenIcon from '@wingbrace/glideslope-icons/full-screen'
import { MediaUIEvents } from 'media-chrome/dist/constants.js'
import GsIcon from '../icon/GsIcon.vue'
import { useMediaControlsDisabled } from './context'
import GsMediaButton from './GsMediaButton.vue'
import type { GsFullscreenButtonProps } from './types'
import { useMediaDispatch, useMediaSelector } from './use-media'

const { disabled = false } = defineProps<GsFullscreenButtonProps>()

const dispatch = useMediaDispatch()
const fullscreen = useMediaSelector((state) => state.mediaIsFullscreen ?? false)
const isDisabled = useMediaControlsDisabled(() => disabled)

function toggle() {
  dispatch({
    type: fullscreen.value
      ? MediaUIEvents.MEDIA_EXIT_FULLSCREEN_REQUEST
      : MediaUIEvents.MEDIA_ENTER_FULLSCREEN_REQUEST,
  })
}
</script>

<template>
  <GsMediaButton
    :label="fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
    :disabled="isDisabled"
    @click="toggle"
  >
    <GsIcon size="medium">
      <CollapseWindowIcon v-if="fullscreen" />
      <FullScreenIcon v-else />
    </GsIcon>
  </GsMediaButton>
</template>
