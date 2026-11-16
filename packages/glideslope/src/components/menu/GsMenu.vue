<script setup lang="ts">
/**
 * A dropdown menu of actions. Bind `v-model:open` to control it. Arrow keys move between items,
 * type-ahead jumps to an item, and Escape closes the menu.
 *
 * Handle items one by one with their `@select`, or give them a `value` and handle them all with the
 * menu's `@action`. For choices that stay selected, use `GsMenuCheckboxItem` or a
 * `GsMenuRadioGroup`. For a menu that opens at the pointer on right-click, use `GsContextMenu`.
 *
 * @example
 * ```vue
 * <GsMenu @action="run">
 *   <template #trigger>
 *     <GsButton variant="icon" aria-label="Track actions"><GsIcon><KebabIcon /></GsIcon></GsButton>
 *   </template>
 *   <GsMenuItem value="rename" label="Rename" hotkey="R" />
 *   <GsMenuSeparator />
 *   <GsMenuItem value="delete" label="Delete" color="critical" />
 * </GsMenu>
 * ```
 */
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'
import { computed } from 'vue'
import { provideMenuContext } from './context'
import styles from './styles.module.css'
import type { GsMenuItemValue, GsMenuProps } from './types'

// Attributes go to the trigger, the only element rendered in place (the content is portalled).
// That lets another overlay wrap this one: its trigger attributes and listeners reach the button.
defineOptions({ inheritAttrs: false })

const {
  variant = 'cozy',
  side = 'bottom',
  align = 'start',
  offset = 8,
  classes,
} = defineProps<GsMenuProps>()

const emit = defineEmits<{
  /** A `GsMenuItem` with a `value` was chosen, here or in a submenu. Receives that `value`. */
  action: [value: GsMenuItemValue]
}>()

/** Open state. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The element that opens the menu, usually a `GsButton`. */
  trigger?: () => unknown
  /** Menu items, sections, separators and submenus. */
  default?: () => unknown
}>()

provideMenuContext({
  kind: 'dropdown',
  variant: computed(() => variant),
  action: (value) => emit('action', value),
})
</script>

<template>
  <DropdownMenuRoot v-model:open="open">
    <DropdownMenuTrigger as-child v-bind="$attrs">
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        :side="side"
        :align="align"
        :side-offset="offset"
        :class="['group/menu', styles.popover, styles.menu, styles[variant], classes?.popover]"
      >
        <slot />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
