<script setup lang="ts">
/**
 * Groups `GsCheckbox` items under a label. Bind the checked values with `v-model` (an array).
 *
 * @example
 * ```vue
 * <GsCheckboxGroup v-model="layers" label="Map layers">
 *   <GsCheckbox value="tracks">Tracks</GsCheckbox>
 *   <GsCheckbox value="airspace">Airspace</GsCheckbox>
 * </GsCheckboxGroup>
 * ```
 */
import { CheckboxGroupRoot, type AcceptableValue } from 'reka-ui'
import { useId } from 'vue'
import labelStyles from '../label/styles.module.css'
import { provideChoiceDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsCheckboxGroupProps } from './types'

const {
  label,
  disabled = false,
  required = false,
  name,
  orientation = 'vertical',
  labelPosition,
  classes,
} = defineProps<GsCheckboxGroupProps>()

/** The values of the checked checkboxes. */
const model = defineModel<AcceptableValue[]>({ default: () => [] })

defineSlots<{
  /** `GsCheckbox` items. */
  default?: () => unknown
}>()

const labelId = useId()

provideChoiceDefaults(() => ({ labelPosition }))
</script>

<template>
  <CheckboxGroupRoot
    v-model="model"
    role="group"
    :aria-labelledby="label ? labelId : undefined"
    :disabled="disabled"
    :required="required"
    :name="name"
    :orientation="orientation"
    :class="['group/checkbox-group', styles.group]"
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
  </CheckboxGroupRoot>
</template>
