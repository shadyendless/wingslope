<script setup lang="ts">
/**
 * Connects media controls to a media element. It renders media-chrome's `<media-controller>`,
 * which watches the `<audio>` or `<video>` in its `media` slot, and gives the controls inside it
 * that controller's media store. It takes the place of media-chrome's React `MediaProvider` and
 * `MediaController` pair. `GsAudio` and `GsVideo` render one for you.
 *
 * media-chrome loads when the first controller mounts in the browser. Until then, and on the
 * server, the controls render in their initial state.
 *
 * @example
 * ```vue
 * <GsMediaController audio>
 *   <audio slot="media" src="/track.mp3" preload="metadata" />
 *   <GsMediaControls>
 *     <GsPlayButton />
 *     <GsTimeRange />
 *     <GsMuteButton />
 *   </GsMediaControls>
 * </GsMediaController>
 * ```
 */
import { computed, onMounted, shallowRef, useTemplateRef } from 'vue'
import { provideMediaStore } from './context'
import { loadMediaChrome } from './media-chrome'
import type { GsMediaControllerProps, GsMediaStore } from './types'

const {
  audio = false,
  noHotkeys = false,
  noVolumePref = false,
  noMutedPref = false,
  lang,
} = defineProps<GsMediaControllerProps>()

defineSlots<{
  /** The media element, with `slot="media"`, and the controls. */
  default?: () => unknown
}>()

/** Boolean attributes media-chrome reads by presence. */
const flag = (on: boolean) => (on ? '' : undefined)

/**
 * media-chrome keeps one language for every controller, and removing the attribute sets it to
 * `null`, which breaks its labels. Once a language was set, unsetting it falls back to the
 * browser's language instead.
 */
let langWasSet = false
const langAttr = computed(() => {
  if (lang) langWasSet = true
  return lang || (langWasSet ? navigator.language || 'en' : undefined)
})

const controller = useTemplateRef<HTMLElement & { mediaStore?: GsMediaStore }>('controller')
const store = shallowRef<GsMediaStore>()
provideMediaStore(store)

onMounted(async () => {
  if (!(await loadMediaChrome())) return
  // The element upgrades when its definition loads, and creates its store when connected.
  store.value = controller.value?.mediaStore
})
</script>

<template>
  <!-- eslint-disable-next-line vue/component-name-in-template-casing -- a media-chrome custom element -->
  <media-controller
    ref="controller"
    :audio.attr="flag(audio)"
    :nohotkeys.attr="flag(noHotkeys)"
    :hotkeys.attr="hotkeys"
    :novolumepref.attr="flag(noVolumePref)"
    :nomutedpref.attr="flag(noMutedPref)"
    :lang.attr="langAttr"
  >
    <slot />
  </media-controller>
</template>
