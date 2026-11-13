<script setup lang="ts">
/**
 * A menu that opens at the pointer when its trigger area is right-clicked, or long-pressed on a
 * touch screen. It takes the same items as `GsMenu` (`GsMenuItem`, sections, separators,
 * checkbox and radio items, submenus) and emits the same `action` event. Bind `v-model:open` to
 * control it.
 *
 * The trigger goes in the `trigger` slot and must be a single element. Make it focusable
 * (`tabindex="0"`) so keyboard users can open the menu with the context-menu key or Shift+F10.
 *
 * @example
 * ```vue
 * <GsContextMenu @action="run">
 *   <template #trigger>
 *     <div tabindex="0" class="h-[200px]">Right-click a track</div>
 *   </template>
 *   <GsMenuItem value="rename" label="Rename" />
 *   <GsMenuItem value="delete" label="Delete" color="critical" />
 * </GsContextMenu>
 * ```
 */
import { ContextMenuContent, ContextMenuPortal, ContextMenuRoot, ContextMenuTrigger } from 'reka-ui'
import { computed } from 'vue'
import { provideMenuContext } from './context'
import styles from './styles.module.css'
import type { GsContextMenuProps, GsMenuItemValue } from './types'

// Attributes go to the trigger area, the only element rendered in place (the content is
// portalled), as in the other overlays.
defineOptions({ inheritAttrs: false })

const { variant = 'cozy', disabled = false, classes } = defineProps<GsContextMenuProps>()

const emit = defineEmits<{
  /** A `GsMenuItem` with a `value` was chosen, here or in a submenu. Receives that `value`. */
  action: [value: GsMenuItemValue]
}>()

/** Open state. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** The area that opens the menu on right-click. A single element. */
  trigger?: () => unknown
  /** Menu items, sections, separators and submenus. */
  default?: () => unknown
}>()

provideMenuContext({
  kind: 'context',
  variant: computed(() => variant),
  action: (value) => emit('action', value),
})
</script>

<template>
  <ContextMenuRoot v-model:open="open">
    <ContextMenuTrigger as-child :disabled="disabled" v-bind="$attrs">
      <slot name="trigger" />
    </ContextMenuTrigger>
    <ContextMenuPortal>
      <ContextMenuContent
        :class="['group/menu', styles.popover, styles.menu, styles[variant], classes?.popover]"
      >
        <slot />
      </ContextMenuContent>
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>
