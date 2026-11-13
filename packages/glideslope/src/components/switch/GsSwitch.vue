<script setup lang="ts">
/**
 * An on/off switch with its label. Bind the state with `v-model`. Use a switch for settings that
 * take effect immediately; use a checkbox for choices submitted with a form.
 *
 * Built on Reka UI's `SwitchRoot`: the whole row is one `role="switch"` button.
 *
 * @example
 * ```vue
 * <GsSwitch v-model="showGrid">Show grid</GsSwitch>
 * ```
 */
import { SwitchRoot } from 'reka-ui'
import styles from './styles.module.css'
import type { GsSwitchProps } from './types'

const {
  disabled = false,
  required = false,
  name,
  labelPosition = 'end',
} = defineProps<GsSwitchProps>()

/** On/off state. */
const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** Label content. Without a label, give the switch an `aria-label`. */
  default?: () => unknown
}>()
</script>

<template>
  <SwitchRoot
    v-model="model"
    :disabled="disabled"
    :required="required"
    :name="name"
    :class="['group/switch', styles.switch, styles[labelPosition]]"
  >
    <span :class="styles.control" />
    <span v-if="$slots.default" :class="styles.label"><slot /></span>
  </SwitchRoot>
</template>
