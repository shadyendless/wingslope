<script setup lang="ts">
/**
 * The heading of a `GsDrawerHeader`. Its `level` sets both the heading level and the size: large for
 * levels 1 to 3, medium for 4 to 6.
 *
 * @example
 * ```vue
 * <GsDrawerHeader>
 *   <GsDrawerHeaderTitle :level="2">Layers</GsDrawerHeaderTitle>
 *   <GsDrawerClose />
 * </GsDrawerHeader>
 * ```
 */
import styles from './styles.module.css'
import type { GsDrawerHeaderTitleProps } from './types'

const { level = 2 } = defineProps<GsDrawerHeaderTitleProps>()

defineSlots<{
  /** Title text. */
  default?: () => unknown
}>()
</script>

<template>
  <component :is="`h${level}`" :class="[styles.title, level <= 3 ? styles.large : styles.medium]">
    <slot />
  </component>
</template>
