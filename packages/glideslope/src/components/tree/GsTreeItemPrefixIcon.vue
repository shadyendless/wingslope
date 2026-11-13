<script setup lang="ts">
/**
 * An icon before the label of a `GsTree` row.
 *
 * @example
 * ```vue
 * <GsTreeItemPrefixIcon><FolderIcon /></GsTreeItemPrefixIcon>
 * ```
 */
import GsIcon from '../icon/GsIcon.vue'
import styles from './styles.module.css'
import type { GsTreeItemPrefixIconProps } from './types'

const { size } = defineProps<GsTreeItemPrefixIconProps>()

defineSlots<{
  /** The SVG icon, e.g. a component from `@wingbrace/glideslope-icons`. */
  default?: () => unknown
}>()
</script>

<template>
  <GsIcon :size="size" :class="styles.icon"><slot /></GsIcon>
</template>
