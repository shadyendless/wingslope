<script setup lang="ts">
/**
 * A tab of a `GsDrawerMenu`: an icon toggle button that opens a view of its drawer (or, with
 * `toggle`, opens and closes it), with its `text-value` as name and tooltip. It is selected while
 * the drawer shows its view, or a view pushed on top of it. Renders nothing outside a `GsDrawer`.
 *
 * @example
 * ```vue
 * <GsDrawerMenuItem for="layers" text-value="Layers" toggle><LayersIcon /></GsDrawerMenuItem>
 * ```
 */
import { computed, onScopeDispose, useId, watch } from 'vue'
import GsToggleButton from '../button/GsToggleButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsTooltip from '../tooltip/GsTooltip.vue'
import type { GsOverlaySide } from '../tooltip/types'
import { injectViewStackContext } from '../view-stack/context'
import { injectDrawerContext } from './context'
import styles from './styles.module.css'
import type { GsDrawerMenuItemProps, GsDrawerPlacement } from './types'
import { useDrawers } from './use-drawers'

// Attributes go to the button, not to the tooltip wrapping it.
defineOptions({ inheritAttrs: false })

const {
  for: view,
  toggle = false,
  textValue,
  disabled = false,
  size,
  color = 'accent',
  variant = 'icon',
  classes,
} = defineProps<GsDrawerMenuItemProps>()

defineSlots<{
  /** The item's icon component (it is wrapped in a `GsIcon`), or short text. */
  default?: () => unknown
}>()

/** The tooltip opens away from the drawer's edge. */
const tooltipSides: Record<GsDrawerPlacement, GsOverlaySide> = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
}

const stack = injectViewStackContext()
const drawer = injectDrawerContext()
const drawers = useDrawers()
const tabId = useId()

const selected = computed(() => {
  if (!stack) return false
  const views = stack.stack.value
  return stack.view.value === view || (views.length > 1 && views.includes(view))
})
const side = computed(() => tooltipSides[drawer?.placement.value ?? 'left'])

// Name the view's panel after this tab.
function claim(next: string) {
  drawer?.tabs.set(next, tabId)
}
function release(previous: string) {
  if (drawer?.tabs.get(previous) === tabId) drawer.tabs.delete(previous)
}
claim(view)
watch(
  () => view,
  (next, previous) => {
    release(previous)
    claim(next)
  },
)
onScopeDispose(() => release(view))

function activate() {
  if (toggle) drawers.toggle(view)
  else drawers.open(view)
}
</script>

<template>
  <GsTooltip v-if="stack" :side="side" :offset="6" :classes="{ content: classes?.tooltip }">
    <template #trigger>
      <GsToggleButton
        :id="tabId"
        role="tab"
        :aria-label="textValue"
        :aria-selected="selected"
        :aria-pressed="undefined"
        :aria-controls="selected ? (stack.view.value ?? undefined) : undefined"
        :model-value="selected"
        :disabled="disabled"
        :size="size"
        :color="color"
        :variant="variant"
        :class="[styles.item, classes?.item]"
        v-bind="$attrs"
        @update:model-value="activate"
      >
        <GsIcon><slot /></GsIcon>
      </GsToggleButton>
    </template>
    {{ textValue }}
  </GsTooltip>
</template>
