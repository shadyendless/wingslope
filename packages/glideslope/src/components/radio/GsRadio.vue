<script setup lang="ts">
/**
 * One option in a `GsRadioGroup`. The whole row is a single `role="radio"` button, so clicking
 * the label selects it and the label is its accessible name.
 */
import { RadioGroupItem } from 'reka-ui'
import { computed } from 'vue'
import { injectChoiceDefaults } from '../checkbox/defaults'
import styles from './styles.module.css'
import type { GsRadioProps } from './types'

const { value, disabled = false, labelPosition, classes } = defineProps<GsRadioProps>()

defineSlots<{
  /** Label content. */
  default?: () => unknown
}>()

const defaults = injectChoiceDefaults()
const position = computed(() => labelPosition ?? defaults.value.labelPosition ?? 'end')
</script>

<template>
  <RadioGroupItem
    :value="value"
    :disabled="disabled"
    :class="['group/radio', styles.radio, { [styles.labelStart ?? '']: position === 'start' }]"
  >
    <span :class="[styles.control, classes?.control]" />
    <span :class="[styles.label, classes?.label]"><slot /></span>
  </RadioGroupItem>
</template>
