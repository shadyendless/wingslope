<script setup lang="ts">
/**
 * One view of a `GsDrawer`: a tab panel shown while the view is on top of the drawer's stack, named
 * by its `GsDrawerMenuItem` when it has one. Holds a `GsDrawerHeader`, `GsDrawerContent` and an
 * optional `GsDrawerFooter`, or sits inside a shared `GsDrawerContent`.
 *
 * @example
 * ```vue
 * <GsDrawerView id="layers">
 *   <GsDrawerHeader title="Layers" />
 *   <GsDrawerContent>…</GsDrawerContent>
 *   <GsDrawerFooter><GsButton>Apply</GsButton></GsDrawerFooter>
 * </GsDrawerView>
 * ```
 */
import GsViewStackView from '../view-stack/GsViewStackView.vue'
import { injectDrawerContext } from './context'
import styles from './styles.module.css'
import type { GsDrawerViewProps } from './types'

// The view renders no element while hidden, so attributes go to the panel element.
defineOptions({ inheritAttrs: false })

const { id } = defineProps<GsDrawerViewProps>()

defineSlots<{
  /** The view's content. */
  default?: () => unknown
}>()

const drawer = injectDrawerContext()
</script>

<template>
  <GsViewStackView :id="id">
    <div
      v-bind="$attrs"
      :id="id"
      role="tabpanel"
      :aria-labelledby="drawer?.tabs.get(id)"
      :class="styles.view"
    >
      <slot />
    </div>
  </GsViewStackView>
</template>
