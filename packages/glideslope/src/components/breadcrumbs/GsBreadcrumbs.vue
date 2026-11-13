<script setup lang="ts">
/**
 * Shows where the current page sits in a hierarchy. Mark the last item `current`.
 *
 * @example
 * ```vue
 * <GsBreadcrumbs>
 *   <GsBreadcrumbItem href="/missions">Missions</GsBreadcrumbItem>
 *   <GsBreadcrumbItem href="/missions/42">Northern watch</GsBreadcrumbItem>
 *   <GsBreadcrumbItem current>Tracks</GsBreadcrumbItem>
 * </GsBreadcrumbs>
 * ```
 */
import styles from './styles.module.css'
import type { GsBreadcrumbsProps } from './types'

const { label = 'Breadcrumb' } = defineProps<GsBreadcrumbsProps>()

defineSlots<{
  /** `GsBreadcrumbItem`s. */
  default?: () => unknown
}>()
</script>

<template>
  <nav :aria-label="label">
    <ol :class="styles.list">
      <slot />
    </ol>
  </nav>
</template>
