<script setup lang="ts">
/** @internal A rule's `checkbox` value editor: a `GsCheckbox` bound to the value. */
import { computed } from 'vue'
import GsCheckbox from '../checkbox/GsCheckbox.vue'
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

const valid = computed(() => getValidationResult(rule, fieldData.validator).valid)
</script>

<template>
  <GsCheckbox
    :model-value="Boolean(value)"
    :disabled="disabled"
    :class="className"
    :aria-label="label"
    :aria-invalid="valid ? undefined : 'true'"
    @update:model-value="handleOnChange"
  />
</template>
