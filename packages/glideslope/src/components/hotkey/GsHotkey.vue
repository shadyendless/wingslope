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
import { computed } from 'vue'
import { injectHotkeyDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsHotkeyProps } from './types'

const { variant } = defineProps<GsHotkeyProps>()

defineSlots<{
  /** Key label, or a `GsIcon` when `variant="icon"`. */
  default?: () => unknown
}>()

const defaults = injectHotkeyDefaults()
const resolvedVariant = computed(() => variant ?? defaults.value.variant ?? 'outline')
</script>

<template>
  <kbd :class="[styles.key, styles[resolvedVariant]]"><slot /></kbd>
</template>
