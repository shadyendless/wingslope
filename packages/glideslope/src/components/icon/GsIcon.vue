<script setup lang="ts">
/**
 * Wraps an SVG icon with consistent sizing and color.
 *
 * The icon color follows the `icon-*` / `fg-*` utilities of its ancestors (via `--icon-color`),
 * and the size follows the nearest parent that provides icon defaults, such as `GsButton`.
 *
 * @example
 * ```vue
 * <GsIcon size="small"><SettingsIcon /></GsIcon>
 * ```
 */
import { computed } from 'vue'
import { injectIconDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsIconProps } from './types'

const { size } = defineProps<GsIconProps>()

defineSlots<{
  /** The SVG icon to display, e.g. a component from `@wingbrace/glideslope-icons`. */
  default?: () => unknown
}>()

const defaults = injectIconDefaults()
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')
</script>

<template>
  <span :class="[styles.icon, defaults.class]" :data-size="resolvedSize">
    <slot />
  </span>
</template>
