<script setup lang="ts">
/**
 * One view of a `GsViewStack`. Its content renders only while it is on top of the stack.
 *
 * @example
 * ```vue
 * <GsViewStackView id="details">
 *   <h2>Details</h2>
 * </GsViewStackView>
 * ```
 */
import { computed, onScopeDispose, watch } from 'vue'
import { injectViewStackContext } from './context'
import type { GsViewStackViewProps } from './types'

const { id } = defineProps<GsViewStackViewProps>()

defineSlots<{
  /** The view's content, rendered while the view is shown. */
  default?: () => unknown
}>()

const context = injectViewStackContext()
if (!context) throw new Error('GsViewStackView must be used inside a GsViewStack')

let unregister = context.registerView(id)
watch(
  () => id,
  (next) => {
    unregister()
    unregister = context.registerView(next)
  },
)
onScopeDispose(() => unregister())

const active = computed(() => context.view.value === id)
</script>

<template>
  <slot v-if="active" />
</template>
