<script setup lang="ts">
/** One option in a `GsMenuRadioGroup`. */
import { injectMenuContext, menuParts } from './context'
import GsMenuItemContent from './GsMenuItemContent.vue'
import styles from './styles.module.css'
import type { GsMenuRadioItemProps } from './types'

const {
  value,
  label,
  hotkey,
  textValue,
  disabled = false,
  color = 'info',
  classes,
} = defineProps<GsMenuRadioItemProps>()

const emit = defineEmits<{
  /** The item was chosen. */
  select: [event: Event]
}>()

defineSlots<{
  default?: () => unknown
}>()

const menu = injectMenuContext()
const parts = menuParts[menu.kind]
</script>

<template>
  <component
    :is="parts.RadioItem"
    :value="value"
    :disabled="disabled"
    :text-value="textValue ?? label"
    :class="['group/menu-item', styles.item, styles[menu.variant.value]]"
    :data-color="color"
    @select="emit('select', $event)"
  >
    <GsMenuItemContent :label="label" :hotkey="hotkey" :classes="classes">
      <slot />
    </GsMenuItemContent>
  </component>
</template>
