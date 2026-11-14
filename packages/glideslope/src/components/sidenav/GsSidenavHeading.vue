<script setup lang="ts">
/**
 * A heading inside a `GsSidenav`, styled for where it is: an uppercase section label in
 * `GsSidenavContent`, or a name in a `GsSidenavAvatar`. It shows only while the sidenav is open.
 * Inside a button (the header, an item) it renders as plain text, since a heading can't go there.
 *
 * @example
 * ```vue
 * <GsSidenavHeading>Views</GsSidenavHeading>
 * ```
 */
import { injectSidenavParts } from './context'
import type { GsSidenavHeadingProps } from './types'

const { level = 3 } = defineProps<GsSidenavHeadingProps>()

defineSlots<{
  /** Heading text. */
  default?: () => unknown
}>()

const parts = injectSidenavParts()
</script>

<template>
  <component :is="parts.interactive ? 'span' : `h${level}`" :class="parts.heading">
    <slot />
  </component>
</template>
