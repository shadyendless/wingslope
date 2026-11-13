<script setup lang="ts">
/**
 * A horizontal or vertical rule that separates content.
 *
 * Built on Reka UI's `Separator`: it is announced as a separator unless `decorative` is set. It
 * stretches to fill its container in both block and flex/grid layouts without measuring the DOM.
 *
 * @example
 * ```vue
 * <div class="flex gap-s">
 *   <span>One</span>
 *   <GsDivider orientation="vertical" />
 *   <span>Two</span>
 * </div>
 * ```
 */
import { Separator } from 'reka-ui'
import styles from './styles.module.css'
import type { GsDividerProps } from './types'

const { orientation = 'horizontal', decorative = false } = defineProps<GsDividerProps>()
</script>

<template>
  <Separator :orientation="orientation" :decorative="decorative" :class="styles.divider" />
</template>
