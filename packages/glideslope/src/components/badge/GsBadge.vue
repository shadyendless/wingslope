<script setup lang="ts">
/**
 * A small status marker: a count or short label, or a dot when it has no content.
 *
 * @example
 * ```vue
 * <GsBadge color="critical">3</GsBadge>
 *
 * <!-- Pinned to the corner of a positioned parent -->
 * <div class="relative">
 *   <GsIcon><BellIcon /></GsIcon>
 *   <GsBadge placement="top right" :offset="2" color="serious" />
 * </div>
 * ```
 */
import { computed } from 'vue'
import { injectBadgeDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsBadgeProps } from './types'

const { color, placement, offset } = defineProps<GsBadgeProps>()

const slots = defineSlots<{
  /** Badge content. Leave empty to render a dot. */
  default?: () => unknown
}>()

const defaults = injectBadgeDefaults()

const resolvedColor = computed(() => color ?? defaults.value.color ?? 'info')
const resolvedPlacement = computed(() => placement ?? defaults.value.placement)

const offsetStyle = computed(() => {
  const value = offset ?? defaults.value.offset
  if (value === undefined) return undefined
  const { x, y } = typeof value === 'number' ? { x: value, y: value } : value
  return {
    '--badge-offset-x': x === undefined ? undefined : `${x}px`,
    '--badge-offset-y': y === undefined ? undefined : `${y}px`,
  }
})
</script>

<template>
  <span
    :class="['group/badge', styles.badge]"
    :style="offsetStyle"
    :data-color="resolvedColor"
    :data-placement="resolvedPlacement"
    :data-empty="slots.default ? undefined : ''"
  >
    <slot />
  </span>
</template>
