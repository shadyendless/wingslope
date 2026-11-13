<script setup lang="ts">
/**
 * A labeled multi-line text input with description, error message and validation.
 *
 * `class` and `style` apply to the field wrapper; other attributes go to the `<textarea>`.
 *
 * @example
 * ```vue
 * <GsTextAreaField v-model="notes" label="Notes" :rows="4" />
 * ```
 */
import { FieldControl } from 'reka-ui'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import styles from './text-area.module.css'
import type { GsTextAreaFieldProps } from './types'

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
  placeholder,
  readonly = false,
  rows,
} = defineProps<GsTextAreaFieldProps>()

/** The text value. */
const model = defineModel<string>({ default: '' })

const { rootAttrs, controlAttrs } = useSplitAttrs()
</script>

<template>
  <GsFieldLayout
    v-slot="{ ariaLabel }"
    v-bind="rootAttrs"
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
    <FieldControl
      v-bind="controlAttrs"
      v-model="model"
      as="textarea"
      :aria-label="ariaLabel ?? controlAttrs['aria-label']"
      :class="styles.input"
      :placeholder="placeholder"
      :readonly="readonly"
      :rows="rows"
    />
  </GsFieldLayout>
</template>
