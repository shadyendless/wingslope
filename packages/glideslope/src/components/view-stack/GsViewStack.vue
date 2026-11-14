<script setup lang="ts">
/**
 * Stack-based navigation between views: shows the `GsViewStackView` on top of its stack. Views are
 * pushed with a `GsViewStackTrigger` or `useViewStacks().push(view)`, and popped, cleared or reset
 * the same way, from inside the stack or from anywhere by the stack's `id`.
 *
 * It renders no element of its own, only its content.
 *
 * @example
 * ```vue
 * <GsViewStack id="inspector" default-view="list">
 *   <GsViewStackView id="list">
 *     <GsViewStackTrigger for="details"><GsButton>Details</GsButton></GsViewStackTrigger>
 *   </GsViewStackView>
 *   <GsViewStackView id="details">
 *     <GsViewStackTrigger for="back"><GsButton>Back</GsButton></GsViewStackTrigger>
 *   </GsViewStackView>
 * </GsViewStack>
 * ```
 */
import { watch } from 'vue'
import { provideViewStack } from './context'
import type { GsViewStackProps } from './types'

const { id, defaultView } = defineProps<GsViewStackProps>()

const emit = defineEmits<{
  /** The view the stack shows changed: the new top of the stack, or `null` when it is empty. */
  change: [view: string | null]
}>()

defineSlots<{
  /** `GsViewStackView`s, and anything else, such as triggers. */
  default?: () => unknown
}>()

const { view } = provideViewStack(
  () => id,
  () => defaultView,
)
watch(view, (next) => emit('change', next))
</script>

<template>
  <slot />
</template>
