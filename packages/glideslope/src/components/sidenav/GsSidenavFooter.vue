<script setup lang="ts">
/**
 * The footer of a `GsSidenav`, for example a `GsSidenavItem` holding the user's
 * `GsSidenavAvatar`. Renders a `<footer>`.
 *
 * @example
 * ```vue
 * <GsSidenavFooter>
 *   <GsSidenavItem text-value="Jo Doe"><GsSidenavAvatar>…</GsSidenavAvatar></GsSidenavItem>
 * </GsSidenavFooter>
 * ```
 */
defineSlots<{
  /** Footer content. */
  default?: () => unknown
}>()
</script>

<template>
  <footer><slot /></footer>
</template>
