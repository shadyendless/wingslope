<script setup lang="ts">
/**
 * Runs drawer commands when its child (usually a `GsButton`) is clicked or activated with the
 * keyboard. `for` takes a view id to push, a command for the surrounding drawer (`'back'`,
 * `'clear'`, `'close'`, `'reset'`), a command with an id (`'open:<view id>'`,
 * `'toggle:<view id>'`, `'close:<drawer id>'`, …) that works from anywhere, or a list of those to
 * run in order.
 *
 * `open` empties the drawer before showing the view; pushing a view id shows it on top of the
 * current one, so `back` returns to it.
 *
 * @example
 * ```vue
 * <GsDrawerTrigger for="open:layers"><GsButton>Layers</GsButton></GsDrawerTrigger>
 * <GsDrawerTrigger for="layer-details"><GsButton>Details</GsButton></GsDrawerTrigger>
 * <GsDrawerTrigger for="close"><GsButton>Done</GsButton></GsDrawerTrigger>
 * ```
 */
import { Primitive } from 'reka-ui'
import { injectViewStackContext, parseTarget } from '../view-stack/context'
import type { GsDrawerAction, GsDrawerTriggerProps } from './types'
import { useDrawers } from './use-drawers'

const { for: target } = defineProps<GsDrawerTriggerProps>()

defineSlots<{
  /** A single clickable element, such as a `GsButton`. */
  default?: () => unknown
}>()

const actions: readonly GsDrawerAction[] = ['back', 'clear', 'close', 'open', 'reset', 'toggle']
const stack = injectViewStackContext()
const drawers = useDrawers()

function run() {
  for (const each of Array.isArray(target) ? target : [target]) {
    const [action, id = stack?.id.value] = parseTarget(each, actions)
    if (id) drawers[action](id)
  }
}
</script>

<template>
  <Primitive as-child @click="run"><slot /></Primitive>
</template>
