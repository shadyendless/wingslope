<script setup lang="ts">
/**
 * Shares tooltip timing across the app: once one tooltip has opened, moving to another shows it
 * immediately. Place it once near the root, e.g. in `App.vue`.
 */
import { TooltipProvider } from 'reka-ui'

const { delay = 250, skipDelay = 300 } = defineProps<{
  /** Hover delay before the first tooltip opens, in milliseconds. @default 250 */
  delay?: number
  /** How long after a tooltip closes the next one still opens instantly. @default 300 */
  skipDelay?: number
}>()

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <TooltipProvider :delay-duration="delay" :skip-delay-duration="skipDelay">
    <slot />
  </TooltipProvider>
</template>
