<script setup lang="ts">
/**
 * @internal Shared inner layout of menu items: slot content (icons, or a custom label and
 * description), the `label` prop, the hotkey and, for submenu triggers, a trailing chevron. Grid
 * areas place each part, so their order in the slot doesn't matter.
 */
import { provideIconDefaults } from '../icon/defaults'
import GsMenuItemLabel from './GsMenuItemLabel.vue'
import GsMenuItemMore from './GsMenuItemMore.vue'
import styles from './styles.module.css'
import type { GsMenuItemClasses } from './types'

const {
  label = undefined,
  hotkey = undefined,
  submenu = false,
  classes = undefined,
} = defineProps<{
  label?: string
  hotkey?: string
  submenu?: boolean
  classes?: GsMenuItemClasses & { more?: string }
}>()

defineSlots<{
  default?: () => unknown
}>()

provideIconDefaults(() => ({
  size: 'small',
  class: [styles.icon, classes?.icon].filter(Boolean).join(' '),
}))
</script>

<template>
  <slot />
  <GsMenuItemLabel v-if="label" :class="classes?.text">{{ label }}</GsMenuItemLabel>
  <kbd v-if="hotkey" :class="[styles.hotkey, classes?.hotkey]">{{ hotkey }}</kbd>
  <GsMenuItemMore v-if="submenu" :icon-class="classes?.more" />
</template>
