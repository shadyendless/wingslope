<script setup lang="ts">
/**
 * A CSS grid that places `GsDrawer`s and a `GsSidenav` on the edges of its `GsDrawerLayoutMain`.
 * `extend` picks which drawers span the full height or width; `push` picks which drawers shrink the
 * main content when they open, while the others float over it.
 *
 * @example
 * ```vue
 * <GsDrawerLayout extend="left right" push="left">
 *   <GsDrawerLayoutMain>Map</GsDrawerLayoutMain>
 *   <GsDrawer id="left-drawer" placement="left">…</GsDrawer>
 * </GsDrawerLayout>
 * ```
 */
import styles from './styles.module.css'
import type { GsDrawerLayoutProps } from './types'

const { extend = 'left right', push } = defineProps<GsDrawerLayoutProps>()

defineSlots<{
  /** One `GsDrawerLayoutMain`, and the `GsDrawer`s or `GsSidenav` around it. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="['group/layout', styles.layout]" :data-extend="extend" :data-push="push">
    <slot />
  </div>
</template>
