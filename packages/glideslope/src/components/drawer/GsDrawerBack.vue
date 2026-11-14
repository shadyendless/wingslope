<script setup lang="ts">
/**
 * A back button for views pushed onto a `GsDrawer`: it pops the current view. Renders only while
 * the drawer's stack holds more than one view.
 *
 * @example
 * ```vue
 * <GsDrawerHeader>
 *   <GsDrawerBack />
 *   <GsDrawerHeaderTitle :level="4">Layer details</GsDrawerHeaderTitle>
 * </GsDrawerHeader>
 * ```
 */
import ChevronLeftIcon from '@wingbrace/glideslope-icons/chevron-left'
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import { injectViewStackContext } from '../view-stack/context'
import GsDrawerTrigger from './GsDrawerTrigger.vue'

// Attributes go to the button, so they can replace its `aria-label`.
defineOptions({ inheritAttrs: false })

const stack = injectViewStackContext()
const nested = computed(() => (stack?.stack.value.length ?? 0) > 1)
</script>

<template>
  <GsDrawerTrigger v-if="nested" for="back">
    <GsButton variant="icon" aria-label="Back" v-bind="$attrs">
      <GsIcon><ChevronLeftIcon /></GsIcon>
    </GsButton>
  </GsDrawerTrigger>
</template>
