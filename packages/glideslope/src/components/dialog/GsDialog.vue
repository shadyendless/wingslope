<script setup lang="ts">
/**
 * A modal dialog for confirmations and focused tasks. It traps focus, blocks the page behind it,
 * and closes on Escape (unless `keyboard-dismiss-disabled`). Bind `v-model:open` to control it.
 *
 * Close it from a button with `GsDialogClose`, or with the `close` function from the default slot.
 *
 * @example
 * ```vue
 * <GsDialog>
 *   <template #trigger><GsButton color="critical">Delete track</GsButton></template>
 *   <GsDialogTitle>Delete RAVEN 21?</GsDialogTitle>
 *   <GsDialogContent>This removes the track for everyone in the cell.</GsDialogContent>
 *   <GsDialogFooter>
 *     <GsDialogClose><GsButton variant="flat">Cancel</GsButton></GsDialogClose>
 *     <GsButton color="critical" @click="remove">Delete</GsButton>
 *   </GsDialogFooter>
 * </GsDialog>
 * ```
 */
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTrigger } from 'reka-ui'
import { computed } from 'vue'
import { provideDialogSize } from './context'
import styles from './styles.module.css'
import type { GsDialogProps } from './types'

// Attributes go to the trigger, the only element rendered in place (the content is portalled).
// That lets another overlay wrap this one: its trigger attributes and listeners reach the button.
defineOptions({ inheritAttrs: false })

const {
  size = 'small',
  dismissable = false,
  keyboardDismissDisabled = false,
  portalTo,
  classes,
} = defineProps<GsDialogProps>()

/** Open state. */
const open = defineModel<boolean>('open', { default: false })

const slots = defineSlots<{
  /** The element that opens the dialog, usually a `GsButton`. Omit when controlling `open`. */
  trigger?: () => unknown
  /** Dialog content: `GsDialogTitle`, `GsDialogContent`, `GsDialogFooter`. */
  default?: (props: { close: () => void }) => unknown
}>()

function close() {
  open.value = false
}

function onPointerDownOutside(event: Event) {
  if (!dismissable) event.preventDefault()
}

function onEscapeKeyDown(event: KeyboardEvent) {
  if (keyboardDismissDisabled) event.preventDefault()
}

provideDialogSize(computed(() => size))
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger v-if="slots.trigger" as-child v-bind="$attrs">
      <slot name="trigger" />
    </DialogTrigger>
    <DialogPortal :to="portalTo">
      <!-- In a portal target, the backdrop covers that element rather than the viewport. -->
      <DialogOverlay
        :class="['group/dialog', styles.overlay, classes?.overlay]"
        :data-size="size"
        :data-contained="portalTo ? '' : undefined"
      >
        <DialogContent
          :class="[styles.dialog, classes?.dialog]"
          :aria-describedby="undefined"
          @pointer-down-outside="onPointerDownOutside"
          @escape-key-down="onEscapeKeyDown"
        >
          <slot :close="close" />
        </DialogContent>
      </DialogOverlay>
    </DialogPortal>
  </DialogRoot>
</template>
