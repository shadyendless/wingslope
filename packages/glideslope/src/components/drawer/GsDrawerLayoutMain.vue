<script setup lang="ts">
/**
 * The main content of a `GsDrawerLayout`. It fills the space the layout's pushing drawers leave.
 * Renders a `<main>` landmark.
 *
 * @example
 * ```vue
 * <GsDrawerLayout push="left">
 *   <GsDrawerLayoutMain>Map</GsDrawerLayoutMain>
 *   <GsDrawer id="left-drawer">…</GsDrawer>
 * </GsDrawerLayout>
 * ```
 */
import styles from './styles.module.css'

defineSlots<{
  /** The main content. */
  default?: () => unknown
}>()
</script>

<template>
  <main :class="styles.main"><slot /></main>
</template>
