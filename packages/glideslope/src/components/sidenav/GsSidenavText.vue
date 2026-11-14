<script setup lang="ts">
/**
 * Text inside a `GsSidenav`, styled for where it is: the label of a `GsSidenavItem` or
 * `GsSidenavLink`, or the secondary line of a `GsSidenavAvatar`. Labels show only while the sidenav
 * is open; collapsed, they still name their item for assistive technology.
 *
 * @example
 * ```vue
 * <GsSidenavItem text-value="Map">
 *   <GsIcon><MapIcon /></GsIcon>
 *   <GsSidenavText>Map</GsSidenavText>
 * </GsSidenavItem>
 * ```
 */
import { injectSidenavParts } from './context'

defineSlots<{
  /** The text. */
  default?: () => unknown
}>()

const parts = injectSidenavParts()
</script>

<template>
  <span :class="parts.text"><slot /></span>
</template>
