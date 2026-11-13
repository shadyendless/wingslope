<script setup lang="ts">
/**
 * An action in a `GsMenu` or `GsContextMenu`. Handle it with `@select`, or give it a `value` and
 * handle every item at once with the menu's `@action`. The menu closes afterwards unless the
 * `select` handler calls `event.preventDefault()`.
 *
 * Use `label` for plain items, or the default slot with `GsIcon`, `GsMenuItemLabel` and
 * `GsMenuItemDescription` for richer ones.
 */
import { injectMenuContext, menuParts } from './context'
import GsMenuItemContent from './GsMenuItemContent.vue'
import styles from './styles.module.css'
import type { GsMenuItemProps } from './types'

const {
  value,
  label,
  hotkey,
  textValue,
  disabled = false,
  color = 'info',
  classes,
} = defineProps<GsMenuItemProps>()

const emit = defineEmits<{
  /** The item was chosen with a click, Enter or Space. */
  select: [event: Event]
}>()

defineSlots<{
  /** Icons, or a `GsMenuItemLabel` and `GsMenuItemDescription` in place of `label`. */
  default?: () => unknown
}>()

const menu = injectMenuContext()
const parts = menuParts[menu.kind]

function onSelect(event: Event) {
  emit('select', event)
  if (value !== undefined) menu.action(value)
}
</script>

<template>
  <component
    :is="parts.Item"
    :disabled="disabled"
    :text-value="textValue ?? label"
    :class="['group/menu-item', styles.item, styles[menu.variant.value]]"
    :data-color="color"
    @select="onSelect"
  >
    <GsMenuItemContent :label="label" :hotkey="hotkey" :classes="classes">
      <slot />
    </GsMenuItemContent>
  </component>
</template>
