<script setup lang="ts">
/**
 * @internal The query builder's selector for fields, operators, value sources and `select`
 * values: a small `GsComboBoxField` that filters its options as you type and can't be cleared.
 * Option groups become `GsOptionSection`s. The `title` ("Field", "Operator", …) names it.
 */
import {
  getValueSelectorUpdate,
  isOptionGroupArray,
  normalizeValueSelectorValue,
  type FullOption,
} from '@react-querybuilder/vue'
import type { AcceptableValue } from 'reka-ui'
import { computed } from 'vue'
import GsOption from '../options/GsOption.vue'
import GsOptionSection from '../options/GsOptionSection.vue'
import GsComboBoxField from '../select-field/GsComboBoxField.vue'
import type { GsQueryBuilderValueSelectorProps } from './types'

// The query builder passes every control its whole prop bag; only the declared props are used.
defineOptions({ inheritAttrs: false })

const {
  options,
  value,
  handleOnChange,
  title,
  disabled = false,
  className,
  multiple = false,
  listsAsArrays = false,
} = defineProps<GsQueryBuilderValueSelectorProps>()

const groups = computed(() => (isOptionGroupArray(options) ? options : null))
const flatOptions = computed<FullOption[]>(() => (isOptionGroupArray(options) ? [] : options))

/** Option names are strings; the query builder may hold a number or boolean value. */
const toName = (key: unknown) =>
  typeof key === 'string' || typeof key === 'number' || typeof key === 'boolean'
    ? String(key)
    : undefined

/** The selected option's name; the first one for a multiselect value. */
const selected = computed(() => {
  const normalized: unknown = normalizeValueSelectorValue(value, multiple)
  return toName(Array.isArray(normalized) ? normalized[0] : normalized)
})

function onSelect(next: AcceptableValue | undefined) {
  const name = toName(next)
  if (name === undefined) return
  handleOnChange(getValueSelectorUpdate(name, { multiple, listsAsArrays }))
}
</script>

<template>
  <GsComboBoxField
    size="small"
    :label="title"
    :model-value="selected"
    :disabled="disabled"
    :clearable="false"
    :classes="{ control: className }"
    @update:model-value="onSelect"
  >
    <template v-if="groups">
      <GsOptionSection v-for="group in groups" :key="group.label" :header="group.label">
        <GsOption
          v-for="option in group.options"
          :key="option.name"
          :value="option.name"
          :label="option.label"
          :disabled="option.disabled"
        />
      </GsOptionSection>
    </template>
    <template v-else>
      <GsOption
        v-for="option in flatOptions"
        :key="option.name"
        :value="option.name"
        :label="option.label"
        :disabled="option.disabled"
      />
    </template>
  </GsComboBoxField>
</template>
