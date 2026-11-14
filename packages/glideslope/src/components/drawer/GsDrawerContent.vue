<script setup lang="ts">
/**
 * The scrollable main area of a `GsDrawerView`, or of a `GsDrawerPanel` whose views share a header
 * and footer.
 *
 * @example
 * ```vue
 * <GsDrawerContent>Layer list</GsDrawerContent>
 * ```
 */
import styles from './styles.module.css'

defineSlots<{
  /** The content. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.content"><slot /></div>
</template>
