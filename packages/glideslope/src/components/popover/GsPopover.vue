<script setup lang="ts">
/**
 * A non-modal panel anchored to a trigger, for supplementary content and quick actions. Bind
 * `v-model:open` to control it; Escape and clicking outside close it.
 *
 * The panel is named by its `GsPopoverTitle`, else by `label`, else by the trigger.
 *
 * @example
 * ```vue
 * <GsPopover>
 *   <template #trigger><GsButton>Details</GsButton></template>
 *   <GsPopoverTitle>RAVEN 21</GsPopoverTitle>
 *   <GsPopoverContent>F-16C at 24,000 ft, heading 274°.</GsPopoverContent>
 *   <GsPopoverFooter>
 *     <GsPopoverClose><GsButton variant="flat">Close</GsButton></GsPopoverClose>
 *   </GsPopoverFooter>
 * </GsPopover>
 * ```
 */
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { useId, useTemplateRef, watch } from 'vue'
import styles from './styles.module.css'
import type { GsPopoverProps } from './types'

// Attributes go to the trigger, the only element rendered in place (the content is portalled).
// That lets another overlay wrap this one: its trigger attributes and listeners reach the button.
defineOptions({ inheritAttrs: false })

const {
  side = 'bottom',
  align = 'center',
  offset = 8,
  modal = false,
  label,
  classes,
} = defineProps<GsPopoverProps>()

/** Open state. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The element that toggles the popover, usually a `GsButton`. */
  trigger?: () => unknown
  /** Panel content: `GsPopoverTitle`, `GsPopoverContent`, `GsPopoverFooter`. */
  default?: (props: { close: () => void }) => unknown
}>()

function close() {
  open.value = false
}

// Reka names the panel after its trigger with `aria-labelledby`, which outranks `aria-label`. So
// `label` is rendered as a hidden element in the panel, and the panel points `aria-labelledby` at
// it once mounted, unless a `GsPopoverTitle` (inside the panel) already names it. A title mounted
// later points the panel at itself, and hands the name back when it unmounts.
const labelId = useId()
const labelElement = useTemplateRef<HTMLElement>('labelElement')
let labelled: { panel: Element; previous: string | null } | undefined
watch(
  labelElement,
  (element) => {
    if (labelled?.panel.getAttribute('aria-labelledby') === labelId) {
      if (labelled.previous) labelled.panel.setAttribute('aria-labelledby', labelled.previous)
      else labelled.panel.removeAttribute('aria-labelledby')
    }
    labelled = undefined
    const panel = element?.closest('[role="dialog"]')
    if (!panel) return
    const previous = panel.getAttribute('aria-labelledby')
    const labeller = previous ? document.getElementById(previous) : null
    if (labeller && panel.contains(labeller)) return
    panel.setAttribute('aria-labelledby', labelId)
    labelled = { panel, previous }
  },
  { flush: 'post' },
)
</script>

<template>
  <PopoverRoot v-model:open="open" :modal="modal">
    <PopoverTrigger as-child v-bind="$attrs">
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :side="side"
        :align="align"
        :side-offset="offset"
        :class="[styles.popover, classes?.popover]"
      >
        <span v-if="label" :id="labelId" ref="labelElement" hidden>{{ label }}</span>
        <slot :close="close" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
