<script setup lang="ts">
/**
 * A close button for a `GsDrawer`: the surrounding one, or the drawer named by `for` (its id or the
 * id of a view in it), so it also works outside the drawer.
 *
 * @example
 * ```vue
 * <GsDrawerHeader>
 *   <GsDrawerHeaderTitle>Layers</GsDrawerHeaderTitle>
 *   <GsDrawerClose />
 * </GsDrawerHeader>
 *
 * <GsDrawerClose for="left-drawer" aria-label="Close layers" />
 * ```
 */
import CancelIcon from '@wingbrace/glideslope-icons/cancel'
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import { injectViewStackContext } from '../view-stack/context'
import GsDrawerTrigger from './GsDrawerTrigger.vue'
import type { GsDrawerCloseProps, GsDrawerTarget } from './types'

// Attributes go to the button, so they can replace its `aria-label`.
defineOptions({ inheritAttrs: false })

const { for: drawer } = defineProps<GsDrawerCloseProps>()

const stack = injectViewStackContext()
const target = computed<GsDrawerTarget>(() => {
  const id = drawer ?? stack?.id.value
  return id ? `close:${id}` : 'close'
})
</script>

<template>
  <GsDrawerTrigger :for="target">
    <GsButton variant="icon" aria-label="Close" v-bind="$attrs">
      <GsIcon><CancelIcon /></GsIcon>
    </GsButton>
  </GsDrawerTrigger>
</template>
