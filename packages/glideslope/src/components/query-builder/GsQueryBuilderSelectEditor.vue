<script setup lang="ts">
/** @internal A rule's `select` value editor: the query builder's combobox, over the value options. */
import type { FullOptionList, FullOption } from '@react-querybuilder/vue'
import { computed } from 'vue'
import GsQueryBuilderValueSelector from './GsQueryBuilderValueSelector.vue'
import type { GsQueryBuilderEditorProps } from './types'

const {
  value,
  handleOnChange,
  values = [],
  type,
  listsAsArrays = false,
  disabled = false,
  className,
  label,
} = defineProps<GsQueryBuilderEditorProps>()

const options = computed(() => values as FullOptionList<FullOption>)
</script>

<template>
  <GsQueryBuilderValueSelector
    :options="options"
    :value="value"
    :handle-on-change="handleOnChange"
    :title="label"
    :disabled="disabled"
    :class-name="className"
    :multiple="type === 'multiselect'"
    :lists-as-arrays="listsAsArrays"
  />
</template>
