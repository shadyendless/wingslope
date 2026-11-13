<script setup lang="ts">
/**
 * A pulsing placeholder shown while content loads. It is one line tall by default (`1lh`), so it
 * matches the surrounding text size. The pulse respects `prefers-reduced-motion`.
 *
 * @example
 * ```vue
 * <GsSkeleton />
 * <GsSkeleton variant="circle" />
 * ```
 */
import styles from './styles.module.css'
import type { GsSkeletonProps } from './types'

const { variant = 'rectangle' } = defineProps<GsSkeletonProps>()
</script>

<template>
  <div :class="[styles.skeleton, styles[variant]]" aria-hidden="true" />
</template>
