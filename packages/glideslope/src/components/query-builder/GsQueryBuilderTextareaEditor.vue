<script setup lang="ts">
/**
 * @internal A rule's `textarea` value editor: a small `GsTextAreaField` with the field's
 * placeholder, showing the validator's reasons as its error.
 */
import { computed } from 'vue'
import GsTextAreaField from '../text-field/GsTextAreaField.vue'
import type { GsQueryBuilderEditorProps } from './types'
import { getValidationResult } from './utils'

const {
  value,
  handleOnChange,
  rule,
  fieldData,
  disabled = false,
  className,
  label,
} = defineProps<GsQueryBuilderEditorProps>()

const validation = computed(() => getValidationResult(rule, fieldData.validator))
const text = computed(() => String(value ?? ''))
</script>

<template>
  <GsTextAreaField
    size="small"
    :label="label"
    :model-value="text"
    :placeholder="fieldData.placeholder"
    :disabled="disabled"
    :invalid="!validation.valid"
    :error-message="validation.reasons?.join('\n')"
    :class="className"
    @update:model-value="handleOnChange"
  />
</template>
