<script setup lang="ts">
/**
 * The header of a `GsDrawerView` or `GsDrawerPanel`. Renders a `<div>`: a `<header>` outside a
 * sectioning element would be a page banner landmark, one per drawer.
 *
 * With `title` it lays itself out: a back button in pushed views, the title, and a close button.
 * The title is an `h2` in the drawer's first view and an `h4` in pushed views. Put your own
 * content in the default slot instead for a custom layout.
 *
 * @example
 * ```vue
 * <GsDrawerHeader title="Layers" />
 *
 * <GsDrawerHeader>
 *   <GsDrawerHeaderTitle>Layers</GsDrawerHeaderTitle>
 *   <GsDrawerClose />
 * </GsDrawerHeader>
 * ```
 */
import CancelIcon from '@wingbrace/glideslope-icons/cancel'
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import { injectViewStackContext } from '../view-stack/context'
import GsDrawerBack from './GsDrawerBack.vue'
import GsDrawerHeaderTitle from './GsDrawerHeaderTitle.vue'
import GsDrawerTrigger from './GsDrawerTrigger.vue'
import styles from './styles.module.css'
import type { GsDrawerHeaderProps } from './types'

const { title } = defineProps<GsDrawerHeaderProps>()

defineSlots<{
  /** Custom header content, in place of the `title` layout. */
  default?: () => unknown
}>()

const stack = injectViewStackContext()
const level = computed(() => ((stack?.stack.value.length ?? 0) > 1 ? 4 : 2))
</script>

<template>
  <div :class="styles.header">
    <slot>
      <GsDrawerBack />
      <GsDrawerHeaderTitle :level="level">{{ title }}</GsDrawerHeaderTitle>
      <GsDrawerTrigger for="clear">
        <GsButton variant="icon" aria-label="Close">
          <GsIcon><CancelIcon /></GsIcon>
        </GsButton>
      </GsDrawerTrigger>
    </slot>
  </div>
</template>
