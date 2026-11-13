<script setup lang="ts">
/**
 * A labeled text input with description, error message and validation.
 *
 * `class` and `style` apply to the field wrapper; other attributes (`autocomplete`, `inputmode`,
 * `aria-*`, listeners) go to the `<input>`. `provideTextFieldDefaults()` sets defaults for every
 * text field below the calling component.
 *
 * @example
 * ```vue
 * <GsTextField v-model="callsign" label="Callsign" description="As filed in the flight plan" required />
 * ```
 */
import { computed } from 'vue'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import GsInput from '../input/GsInput.vue'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { injectTextFieldDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsTextFieldProps } from './types'

defineOptions({ inheritAttrs: false })

const {
  label,
  description,
  errorMessage,
  size,
  invalid = false,
  disabled = undefined,
  required = undefined,
  name,
  validate,
  validationMode,
  type = 'text',
  placeholder,
  readonly = undefined,
  clearable = undefined,
  autoSize = undefined,
  minLength,
  maxLength,
  classes,
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

const defaults = injectTextFieldDefaults()
const resolved = computed(() => ({
  size: size ?? defaults.value.size ?? 'medium',
  disabled: disabled ?? defaults.value.disabled ?? false,
  required: required ?? defaults.value.required ?? false,
  readonly: readonly ?? defaults.value.readonly ?? false,
  clearable: clearable ?? defaults.value.clearable ?? true,
  autoSize: autoSize ?? defaults.value.autoSize ?? false,
  validationMode: validationMode ?? defaults.value.validationMode,
  classes: classes ?? defaults.value.classes,
}))

/** `GsInput`'s parts; its `container` is the root, so that class goes on the component. */
const inputClasses = computed(() => {
  const { container, sizer, ...parts } = resolved.value.classes?.input ?? {}
  return { container, parts: { ...parts, sizer: [styles.sizer, sizer].filter(Boolean).join(' ') } }
})
</script>

<template>
  <GsFieldLayout
    v-slot="{ invalid: isInvalid, ariaLabel }"
    v-bind="rootAttrs"
    class="group/text-field"
    :label="label"
    :description="description"
    :error-message="errorMessage"
    :size="resolved.size"
    :invalid="invalid"
    :disabled="resolved.disabled"
    :required="resolved.required"
    :name="name"
    :validate="validate"
    :validation-mode="resolved.validationMode"
    :classes="resolved.classes"
  >
    <GsInput
      v-bind="controlAttrs"
      v-model="model"
      :aria-label="ariaLabel ?? controlAttrs['aria-label']"
      :class="inputClasses.container"
      :classes="inputClasses.parts"
      :size="resolved.size"
      :type="type"
      :placeholder="placeholder"
      :disabled="resolved.disabled"
      :readonly="resolved.readonly"
      :required="resolved.required"
      :invalid="isInvalid"
      :clearable="resolved.clearable"
      :auto-size="resolved.autoSize"
      :minlength="minLength"
      :maxlength="maxLength"
    >
      <template v-if="$slots.prefix" #prefix><slot name="prefix" /></template>
      <template v-if="$slots.suffix" #suffix><slot name="suffix" /></template>
    </GsInput>
  </GsFieldLayout>
</template>
