<script setup lang="ts">
/**
 * Runs view stack commands when its child (usually a `GsButton`) is clicked or activated with the
 * keyboard. `for` names a view to push, a command for the surrounding stack (`'back'`, `'clear'`,
 * `'reset'`), a command for a stack by id (`'back:<stack id>'`), or a list of those to run in
 * order.
 *
 * @example
 * ```vue
 * <GsViewStackTrigger for="details"><GsButton>Details</GsButton></GsViewStackTrigger>
 * <GsViewStackTrigger for="back"><GsButton>Back</GsButton></GsViewStackTrigger>
 * <GsViewStackTrigger :for="['clear:inspector', 'list']"><GsButton>Start over</GsButton></GsViewStackTrigger>
 * ```
 */
import { Primitive } from 'reka-ui'
import { injectViewStackContext, parseTarget } from './context'
import type { GsViewStackAction, GsViewStackTriggerProps } from './types'
import { useViewStacks } from './use-view-stacks'

const { for: target } = defineProps<GsViewStackTriggerProps>()

defineSlots<{
  /** A single clickable element, such as a `GsButton`. */
  default?: () => unknown
}>()

const actions: readonly GsViewStackAction[] = ['back', 'clear', 'reset']
const stack = injectViewStackContext()
const viewStacks = useViewStacks()

function run() {
  for (const each of Array.isArray(target) ? target : [target]) {
    const [action, id = stack?.id.value] = parseTarget(each, actions)
    if (id) viewStacks[action](id)
  }
}
</script>

<template>
  <Primitive as-child @click="run"><slot /></Primitive>
</template>
