<script setup lang="ts">
/**
 * A labeled text input with description, error message and validation.
 *
 * `class` and `style` apply to the field wrapper; other attributes (`autocomplete`, `inputmode`,
 * `aria-*`, listeners) go to the `<input>`.
 *
 * @example
 * ```vue
 * <GsTextField v-model="callsign" label="Callsign" description="As filed in the flight plan" required />
 * ```
 */
import GsFieldLayout from '../field/GsFieldLayout.vue'
import GsInput from '../input/GsInput.vue'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import styles from './styles.module.css'
import type { GsTextFieldProps } from './types'

defineOptions({ inheritAttrs: false })

const {
  label,
  description,
  errorMessage,
  size = 'medium',
  invalid = false,
  disabled = false,
  required = false,
  name,
  validate,
  validationMode,
  type = 'text',
  placeholder,
  readonly = false,
  clearable = true,
  autoSize = false,
} = defineProps<GsTextFieldProps>()

/** The input value. */
const model = defineModel<string | number>({ default: '' })

defineSlots<{
  /** Content before the input. */
  prefix?: () => unknown
  /** Content after the input. */
  suffix?: () => unknown
}>()

const { rootAttrs, controlAttrs } = useSplitAttrs()
</script>

<template>
  <GsFieldLayout
    v-slot="{ invalid: isInvalid, ariaLabel }"
    v-bind="rootAttrs"
    class="group/text-field"
    :label="label"
    :description="description"
    :error-message="errorMessage"
    :size="size"
    :invalid="invalid"
    :disabled="disabled"
    :required="required"
    :name="name"
    :validate="validate"
    :validation-mode="validationMode"
  >
    <GsInput
      v-bind="controlAttrs"
      v-model="model"
      :aria-label="ariaLabel ?? controlAttrs['aria-label']"
      :classes="{ sizer: styles.sizer }"
      :size="size"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :invalid="isInvalid"
      :clearable="clearable"
      :auto-size="autoSize"
    >
      <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
      <template v-if="$slots.suffix" #suffix><slot name="suffix" /></template>
    </GsInput>
  </GsFieldLayout>
</template>
