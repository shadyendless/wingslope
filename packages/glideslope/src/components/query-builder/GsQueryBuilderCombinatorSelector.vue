<script setup lang="ts">
/**
 * The query builder's AND / OR choice for a rule group: a horizontal `GsRadioGroup` with one
 * radio per combinator. Hovering or focusing a radio shows a tooltip explaining it. As in the
 * Design Toolkit, choosing a radio sets the combinator to its label (`AND`, `OR`); a group whose
 * combinator is a name (`and`) shows the matching radio checked.
 *
 * @example
 * ```vue
 * <GsQueryBuilder :fields="fields" :control-elements="{ combinatorSelector: GsQueryBuilderCombinatorSelector }" />
 * ```
 */
import { isOptionGroupArray, type FullOption } from '@react-querybuilder/vue'
import { computed } from 'vue'
import GsRadio from '../radio/GsRadio.vue'
import GsRadioGroup from '../radio/GsRadioGroup.vue'
import GsTooltip from '../tooltip/GsTooltip.vue'
import styles from './styles.module.css'
import type { GsQueryBuilderCombinatorSelectorProps } from './types'

// The query builder passes every control its whole prop bag; only the declared props are used.
defineOptions({ inheritAttrs: false })

const {
  options,
  value,
  handleOnChange,
  title,
  disabled = false,
  className,
} = defineProps<GsQueryBuilderCombinatorSelectorProps>()

const operatorDescriptions: Record<string, string> = {
  AND: 'All rules below must be true for a match',
  OR: 'One of the rules below must be true for a match',
}

const flatOptions = computed<FullOption[]>(() =>
  isOptionGroupArray(options) ? options.flatMap((group) => group.options) : options,
)

/** The label of the selected combinator, matched by label or by name. */
const selected = computed(
  () => flatOptions.value.find((option) => option.label === value || option.name === value)?.label,
)
</script>

<template>
  <GsRadioGroup
    :model-value="selected"
    :label="title || 'Combinator'"
    orientation="horizontal"
    required
    :disabled="disabled"
    :class="[styles.combinatorGroup, className]"
    @update:model-value="handleOnChange"
  >
    <GsTooltip
      v-for="option in flatOptions"
      :key="option.label"
      side="top"
      :disabled="!operatorDescriptions[option.label]"
    >
      <template #trigger>
        <!-- The tooltip trigger sets `data-state` on the radio; this keeps the radio's own. -->
        <GsRadio
          :value="option.label"
          :data-state="selected === option.label ? 'checked' : 'unchecked'"
        >
          {{ option.label }}
        </GsRadio>
      </template>
      {{ operatorDescriptions[option.label] }}
    </GsTooltip>
  </GsRadioGroup>
</template>
