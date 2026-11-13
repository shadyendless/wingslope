<script setup lang="ts">
/**
 * Displays a single keyboard key. Group keys of a shortcut with `GsHotkeySet`.
 *
 * @example
 * ```vue
 * <GsHotkeySet>
 *   <GsHotkey>Ctrl</GsHotkey>
 *   +
 *   <GsHotkey>K</GsHotkey>
 * </GsHotkeySet>
 * ```
 */
import styles from './styles.module.css'
import type { GsHotkeyProps } from './types'

const { variant = 'outline' } = defineProps<GsHotkeyProps>()

defineSlots<{
  /** Key label, or a `GsIcon` when `variant="icon"`. */
  default?: () => unknown
}>()
</script>

<template>
  <kbd :class="[styles.key, styles[variant]]"><slot /></kbd>
</template>
