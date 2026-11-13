<script setup lang="ts">
/**
 * A set of mutually exclusive `GsRadio` options. Bind the selected value with `v-model`.
 * Arrow keys move between options.
 *
 * @example
 * ```vue
 * <GsRadioGroup v-model="units" label="Units" orientation="horizontal">
 *   <GsRadio value="metric">Metric</GsRadio>
 *   <GsRadio value="imperial">Imperial</GsRadio>
 * </GsRadioGroup>
 * ```
 */
import { RadioGroupRoot, type AcceptableValue } from 'reka-ui'
import { useId } from 'vue'
import { provideChoiceDefaults } from '../checkbox/defaults'
import labelStyles from '../label/styles.module.css'
import styles from './styles.module.css'
import type { GsRadioGroupProps } from './types'

const {
  label,
  disabled = false,
  required = false,
  name,
  orientation = 'vertical',
  labelPosition,
  classes,
} = defineProps<GsRadioGroupProps>()

/** The selected value. */
const model = defineModel<AcceptableValue>()

defineSlots<{
  /** `GsRadio` items. */
  default?: () => unknown
}>()

const labelId = useId()

provideChoiceDefaults(() => ({ labelPosition }))
</script>

<template>
  <RadioGroupRoot
    v-model="model"
    :aria-labelledby="label ? labelId : undefined"
    :disabled="disabled"
    :required="required"
    :name="name"
    :orientation="orientation"
    :class="['group/radio-group', styles.group]"
    :data-orientation="orientation"
  >
    <span
      v-if="label"
      :id="labelId"
      :class="[labelStyles.label, styles.groupLabel, classes?.label]"
      :data-disabled="disabled ? '' : undefined"
    >
      {{ label }}<template v-if="!required"> (optional)</template>
    </span>
    <slot />
  </RadioGroupRoot>
</template>
