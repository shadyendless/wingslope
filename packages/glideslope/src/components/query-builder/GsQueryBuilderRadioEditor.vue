<script setup lang="ts">
/** @internal A rule's `radio` value editor: a `GsRadioGroup` with a radio per value option. */
import { defaultPlaceholderValueName, type FullOption } from '@react-querybuilder/vue'
import type { AcceptableValue } from 'reka-ui'
import { computed } from 'vue'
import GsRadio from '../radio/GsRadio.vue'
import GsRadioGroup from '../radio/GsRadioGroup.vue'
import type { GsQueryBuilderEditorProps } from './types'
import { getValidationResult } from './utils'

const {
  value,
  handleOnChange,
  rule,
  fieldData,
  values = [],
  disabled = false,
  className,
  label,
} = defineProps<GsQueryBuilderEditorProps>()

const valid = computed(() => getValidationResult(rule, fieldData.validator).valid)
// The value list starts with a placeholder ("------") unless `autoSelectValue` is set. A radio
// group shows no value by checking none, so it is left out.
const options = computed(() =>
  (values as FullOption[]).filter((option) => option.name !== defaultPlaceholderValueName),
)
</script>

<template>
  <GsRadioGroup
    :model-value="value as AcceptableValue"
    :disabled="disabled"
    :class="className"
    :aria-label="label"
    :aria-invalid="valid ? undefined : 'true'"
    @update:model-value="handleOnChange"
  >
    <GsRadio v-for="option in options" :key="option.name" :value="option.value">
      {{ option.label }}
    </GsRadio>
  </GsRadioGroup>
</template>
