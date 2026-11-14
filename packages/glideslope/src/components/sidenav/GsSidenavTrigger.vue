<script setup lang="ts">
/**
 * Opens, closes or toggles a `GsSidenav` when its child (usually a `GsButton`) is clicked or
 * activated with the keyboard. Given a sidenav's id it toggles it, and tells assistive technology
 * whether the sidenav is expanded.
 *
 * @example
 * ```vue
 * <GsSidenavTrigger for="app-nav">
 *   <GsButton variant="icon" aria-label="Navigation"><GsIcon><MenuIcon /></GsIcon></GsButton>
 * </GsSidenavTrigger>
 *
 * <GsSidenavTrigger for="close:app-nav"><GsButton>Close navigation</GsButton></GsSidenavTrigger>
 * ```
 */
import { Primitive } from 'reka-ui'
import { computed } from 'vue'
import type { GsSidenavAction, GsSidenavTriggerProps } from './types'
import { useSidenavs } from './use-sidenavs'

const { for: target } = defineProps<GsSidenavTriggerProps>()

defineSlots<{
  /** A single clickable element, such as a `GsButton`. */
  default?: () => unknown
}>()

const actions: readonly string[] = ['close', 'open', 'toggle']
const sidenavs = useSidenavs()

/** `'open:nav'` → `['open', 'nav']`; a bare id toggles: `'nav'` → `['toggle', 'nav']`. */
const command = computed<[GsSidenavAction, string]>(() => {
  const colon = target.indexOf(':')
  const action = target.slice(0, colon)
  return colon > 0 && actions.includes(action)
    ? [action as GsSidenavAction, target.slice(colon + 1)]
    : ['toggle', target]
})
const toggles = computed(() => command.value[0] === 'toggle')

function run() {
  const [action, id] = command.value
  sidenavs[action](id)
}
</script>

<template>
  <Primitive
    as-child
    :aria-expanded="toggles ? sidenavs.isOpen(command[1]) : undefined"
    :aria-controls="toggles ? command[1] : undefined"
    @click="run"
  >
    <slot />
  </Primitive>
</template>
