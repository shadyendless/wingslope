<script setup lang="ts">
/**
 * A selectable item of a `GsSidenavMenu`: a toggle button, styled for the expanded menu or the
 * collapsed menu's panel. Bind the selected state with `v-model`.
 *
 * @example
 * ```vue
 * <GsSidenavMenuItem v-model="onProfile"><GsSidenavText>Profile</GsSidenavText></GsSidenavMenuItem>
 * ```
 */
import { Toggle } from 'reka-ui'
import { injectSidenavMenuItemClass, provideSidenavParts } from './context'
import styles from './styles.module.css'
import type { GsSidenavMenuItemProps } from './types'

const { disabled = false } = defineProps<GsSidenavMenuItemProps>()

/** Whether the item is selected. Works uncontrolled too. */
const selected = defineModel<boolean>({ default: false })

defineSlots<{
  /** The item's label, such as a `GsSidenavText`. */
  default?: () => unknown
}>()

const itemClass = injectSidenavMenuItemClass()

provideSidenavParts(() => ({ interactive: true }))
</script>

<template>
  <Toggle v-model="selected" :disabled="disabled" :class="itemClass ?? styles.item">
    <slot />
  </Toggle>
</template>
