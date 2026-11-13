<script setup lang="ts">
/**
 * A labeled multi-line text input with description, error message and validation.
 *
 * `class` and `style` apply to the field wrapper; other attributes go to the `<textarea>`.
 * `provideTextAreaFieldDefaults()` sets defaults for every text area field below the calling
 * component.
 *
 * @example
 * ```vue
 * <GsTextAreaField v-model="notes" label="Notes" :rows="4" />
 * ```
 */
import { FieldControl } from 'reka-ui'
import { computed } from 'vue'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { injectTextAreaFieldDefaults } from './defaults'
import styles from './text-area.module.css'
import type { GsTextAreaFieldProps } from './types'

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
  placeholder,
  readonly = undefined,
  rows,
  minLength,
  maxLength,
  classes,
} = defineProps<GsTextAreaFieldProps>()

/** The text value. */
const model = defineModel<string>({ default: '' })

const { rootAttrs, controlAttrs } = useSplitAttrs()

const defaults = injectTextAreaFieldDefaults()
const resolved = computed(() => ({
  size: size ?? defaults.value.size ?? 'medium',
  disabled: disabled ?? defaults.value.disabled ?? false,
  required: required ?? defaults.value.required ?? false,
  readonly: readonly ?? defaults.value.readonly ?? false,
  validationMode: validationMode ?? defaults.value.validationMode,
  classes: classes ?? defaults.value.classes,
}))
</script>

<template>
  <GsFieldLayout
    v-slot="{ ariaLabel }"
    v-bind="rootAttrs"
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
    <FieldControl
      v-bind="controlAttrs"
      v-model="model"
      as="textarea"
      :aria-label="ariaLabel ?? controlAttrs['aria-label']"
      :class="[styles.input, resolved.classes?.input]"
      :placeholder="placeholder"
      :readonly="resolved.readonly"
      :rows="rows"
      :minlength="minLength"
      :maxlength="maxLength"
    />
  </GsFieldLayout>
</template>
