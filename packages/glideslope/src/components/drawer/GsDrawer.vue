<script setup lang="ts">
/**
 * A panel that slides in from an edge of a `GsDrawerLayout`, for navigation or contextual content.
 * A drawer is a view stack: it shows the `GsDrawerView` on top of its stack, and is open while it
 * shows one. Open, close and navigate it with a `GsDrawerMenu`, `GsDrawerTrigger`s, or
 * `useDrawers()` from anywhere.
 *
 * @example
 * ```vue
 * <GsDrawerLayout push="left">
 *   <GsDrawerLayoutMain>
 *     <GsDrawerTrigger for="open:layers"><GsButton>Layers</GsButton></GsDrawerTrigger>
 *   </GsDrawerLayoutMain>
 *   <GsDrawer id="left-drawer" default-view="layers">
 *     <GsDrawerPanel>
 *       <GsDrawerView id="layers">
 *         <GsDrawerHeader title="Layers" />
 *         <GsDrawerContent>…</GsDrawerContent>
 *       </GsDrawerView>
 *     </GsDrawerPanel>
 *   </GsDrawer>
 * </GsDrawerLayout>
 * ```
 */
import { computed, onScopeDispose, shallowReactive, watch } from 'vue'
import { provideViewStack } from '../view-stack/context'
import { provideDrawerContext } from './context'
import styles from './styles.module.css'
import type { GsDrawerProps } from './types'
import { registerDrawer } from './use-drawers'

const { id, defaultView, placement = 'left', size = 'medium' } = defineProps<GsDrawerProps>()

const emit = defineEmits<{
  /** The view the drawer shows changed: the new view, or `null` when the drawer closed. */
  change: [view: string | null]
}>()

defineSlots<{
  /** An optional `GsDrawerMenu` and one `GsDrawerPanel`. */
  default?: () => unknown
}>()

const { view } = provideViewStack(
  () => id,
  () => defaultView,
)
watch(view, (next) => emit('change', next))

let unregister = registerDrawer(id)
watch(
  () => id,
  (next) => {
    unregister()
    unregister = registerDrawer(next)
  },
)
onScopeDispose(() => unregister())

provideDrawerContext({
  placement: computed(() => placement),
  tabs: shallowReactive(new Map()),
})
</script>

<template>
  <div
    :id="id"
    :class="['group/drawer', styles.drawer]"
    :data-state="view ? 'open' : 'closed'"
    :data-placement="placement"
    :data-size="size"
  >
    <slot />
  </div>
</template>
