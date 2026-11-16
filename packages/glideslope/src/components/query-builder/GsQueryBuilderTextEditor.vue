<script setup lang="ts">
/**
 * @internal A rule's `text` value editor: a small `GsTextField` with the field's `inputType` and
 * placeholder, showing the validator's reasons as its error.
 */
import { computed } from 'vue'
import type { GsInputProps } from '../input/types'
import GsTextField from '../text-field/GsTextField.vue'
import styles from './styles.module.css'
import type { GsQueryBuilderEditorProps } from './types'
import { getValidationResult } from './utils'

const {
  value,
  handleOnChange,
  rule,
  fieldData,
  inputType,
  disabled = false,
  className,
  label,
} = defineProps<GsQueryBuilderEditorProps>()

const validation = computed(() => getValidationResult(rule, fieldData.validator))
// A field's `inputType` can be any string; `GsInput` types the input types it supports.
const type = computed(() => (inputType ?? 'text') as GsInputProps['type'])
const text = computed(() => (typeof value === 'number' ? value : String(value ?? '')))
</script>

<template>
  <GsTextField
    size="small"
    :label="label"
    :model-value="text"
    :type="type"
    :placeholder="fieldData.placeholder"
    :disabled="disabled"
    :invalid="!validation.valid"
    :error-message="validation.reasons?.join('\n')"
    :class="className"
    :classes="{ input: { container: styles.textInput } }"
    @update:model-value="handleOnChange"
  />
</template>
