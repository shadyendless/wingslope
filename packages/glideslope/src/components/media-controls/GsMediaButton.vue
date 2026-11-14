<script setup lang="ts">
/**
 * Internal: the icon button every media button renders, with a fixed variant and size.
 *
 * `<media-controller>` handles Space as a play/pause shortcut and cancels its `keydown`, which
 * would stop a native button from activating. Stopping Space here lets the button handle it, so
 * Space on the mute button mutes instead of pausing.
 */
import GsButton from '../button/GsButton.vue'

defineProps<{
  /** Accessible name. */
  label: string
  disabled: boolean
}>()

defineSlots<{
  /** The icon or text. */
  default?: () => unknown
}>()
</script>

<template>
  <GsButton
    variant="icon"
    size="medium"
    :disabled="disabled"
    :aria-label="label"
    @keydown.space.stop
  >
    <slot />
  </GsButton>
</template>
