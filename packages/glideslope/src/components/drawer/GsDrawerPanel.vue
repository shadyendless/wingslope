<script setup lang="ts">
/**
 * The panel of a `GsDrawer`, shown while the drawer is open. Holds its `GsDrawerView`s, or a header,
 * content and footer shared by all views. Use one per drawer.
 *
 * @example
 * ```vue
 * <GsDrawerPanel>
 *   <GsDrawerView id="layers">…</GsDrawerView>
 * </GsDrawerPanel>
 * ```
 */
import styles from './styles.module.css'

defineSlots<{
  /** `GsDrawerView`s, or a `GsDrawerHeader`, `GsDrawerContent` and `GsDrawerFooter`. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.panel"><slot /></div>
</template>
