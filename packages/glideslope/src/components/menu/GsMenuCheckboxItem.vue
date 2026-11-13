<script setup lang="ts">
/** A menu item that toggles on and off. Bind its state with `v-model`. */
import { injectMenuContext, menuParts } from './context'
import GsMenuItemContent from './GsMenuItemContent.vue'
import styles from './styles.module.css'
import type { GsMenuCheckboxItemProps } from './types'

const {
  label,
  hotkey,
  textValue,
  disabled = false,
  color = 'info',
  classes,
} = defineProps<GsMenuCheckboxItemProps>()

const emit = defineEmits<{
  /** The item was chosen. */
  select: [event: Event]
}>()

/** Checked state. */
const checked = defineModel<boolean>({ default: false })

defineSlots<{
  default?: () => unknown
}>()

const menu = injectMenuContext()
const parts = menuParts[menu.kind]
</script>

<template>
  <component
    :is="parts.CheckboxItem"
    v-model="checked"
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
