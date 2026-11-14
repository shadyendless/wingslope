<script setup lang="ts">
/**
 * The footer of a `GsDrawerView` or `GsDrawerPanel`, usually for actions. Renders a `<footer>`.
 *
 * @example
 * ```vue
 * <GsDrawerFooter><GsButton>Apply</GsButton></GsDrawerFooter>
 * ```
 */
import styles from './styles.module.css'

defineSlots<{
  /** Actions or supplementary information. */
  default?: () => unknown
}>()
</script>

<template>
  <footer :class="styles.footer"><slot /></footer>
</template>
