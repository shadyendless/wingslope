<script setup lang="ts">
/**
 * An on/off switch with its label. Bind the state with `v-model`. Use a switch for settings that
 * take effect immediately; use a checkbox for choices submitted with a form.
 *
 * Built on Reka UI's `SwitchRoot`: the whole row is one `role="switch"` button.
 * `provideSwitchDefaults()` sets defaults for every switch below the calling component.
 *
 * @example
 * ```vue
 * <GsSwitch v-model="showGrid">Show grid</GsSwitch>
 * ```
 */
import { SwitchRoot } from 'reka-ui'
import { computed } from 'vue'
import { injectSwitchDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsSwitchProps } from './types'

const {
  disabled = undefined,
  required = false,
  name,
  labelPosition,
  classes,
} = defineProps<GsSwitchProps>()

/** On/off state. */
const model = defineModel<boolean>({ default: false })

defineSlots<{
  /** Label content. Without a label, give the switch an `aria-label`. */
  default?: () => unknown
}>()

const defaults = injectSwitchDefaults()
const position = computed(() => labelPosition ?? defaults.value.labelPosition ?? 'end')
const isDisabled = computed(() => disabled ?? defaults.value.disabled ?? false)
const resolvedClasses = computed(() => classes ?? defaults.value.classes)
</script>

<template>
  <SwitchRoot
    v-model="model"
    :disabled="isDisabled"
    :required="required"
    :name="name"
    :class="['group/switch', styles.switch, styles[position]]"
  >
    <span :class="[styles.control, resolvedClasses?.control]" />
    <span v-if="$slots.default" :class="[styles.label, resolvedClasses?.label]"><slot /></span>
  </SwitchRoot>
</template>
