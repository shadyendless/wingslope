<script setup lang="ts">
/**
 * The tabs that switch a `GsDrawer`'s views, attached to the drawer's inner edge. Renders a `<nav>`
 * landmark (name it with `aria-label`) holding a tab list of `GsDrawerMenuItem`s.
 *
 * @example
 * ```vue
 * <GsDrawerMenu aria-label="Map tools">
 *   <GsDrawerMenuItem for="layers" text-value="Layers"><LayersIcon /></GsDrawerMenuItem>
 *   <GsDrawerMenuItem for="search" text-value="Search"><SearchIcon /></GsDrawerMenuItem>
 * </GsDrawerMenu>
 * ```
 */
import { computed } from 'vue'
import { injectDrawerContext } from './context'
import styles from './styles.module.css'
import type { GsDrawerMenuProps } from './types'

const { position = 'center' } = defineProps<GsDrawerMenuProps>()

defineSlots<{
  /** `GsDrawerMenuItem`s. */
  default?: () => unknown
}>()

const drawer = injectDrawerContext()
const orientation = computed(() => {
  const placement = drawer?.placement.value ?? 'left'
  return placement === 'top' || placement === 'bottom' ? 'horizontal' : 'vertical'
})
</script>

<template>
  <nav :class="[styles.menu, styles[position]]">
    <div
      role="tablist"
      :aria-orientation="orientation"
      :data-orientation="orientation"
      :class="styles.tabs"
    >
      <slot />
    </div>
  </nav>
</template>
