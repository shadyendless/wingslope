<script setup lang="ts">
/** Groups related options under a heading. */
import {
  ComboboxGroup,
  ComboboxLabel,
  ListboxGroup,
  ListboxGroupLabel,
  SelectGroup,
  SelectLabel,
} from 'reka-ui'
import { computed } from 'vue'
import { injectOptionsContext } from './context'
import styles from './styles.module.css'
import type { GsOptionSectionProps } from './types'

const { header } = defineProps<GsOptionSectionProps>()

defineSlots<{
  /** `GsOption` items. */
  default?: () => unknown
}>()

const options = injectOptionsContext()
const parts = computed(() =>
  options.kind === 'registry'
    ? undefined
    : {
        select: [SelectGroup, SelectLabel],
        combobox: [ComboboxGroup, ComboboxLabel],
        listbox: [ListboxGroup, ListboxGroupLabel],
      }[options.kind],
)
</script>

<template>
  <slot v-if="!parts" />
  <component :is="parts[0]" v-else :class="styles.section">
    <component :is="parts[1]" :class="styles.header">{{ header }}</component>
    <slot />
  </component>
</template>
