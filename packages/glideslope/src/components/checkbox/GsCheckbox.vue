<script setup lang="ts">
/**
 * A checkbox with its label. Bind `v-model` to a boolean (or `'indeterminate'`), or place it in a
 * `GsCheckboxGroup` and give it a `value`.
 *
 * Built on Reka UI's `CheckboxRoot`: the whole row is one button with `role="checkbox"`, so
 * clicking the label toggles it and the label is its accessible name.
 *
 * @example
 * ```vue
 * <GsCheckbox v-model="acknowledged">I have read the briefing</GsCheckbox>
 * ```
 */
import CheckIcon from '@wingbrace/glideslope-icons/check'
import RemoveIcon from '@wingbrace/glideslope-icons/remove'
import { CheckboxRoot } from 'reka-ui'
import { computed } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import { injectChoiceDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsCheckboxProps } from './types'

const {
  value,
  disabled = false,
  required = false,
  name,
  labelPosition,
  classes,
} = defineProps<GsCheckboxProps>()

/** Checked state. Ignored inside a `GsCheckboxGroup`, which owns the values. */
const model = defineModel<boolean | 'indeterminate' | undefined>({ default: undefined })

defineSlots<{
  /** Label content. */
  default?: () => unknown
}>()

const defaults = injectChoiceDefaults()
const position = computed(() => labelPosition ?? defaults.value.labelPosition ?? 'end')
</script>

<template>
  <CheckboxRoot
    v-slot="{ state }"
    v-model="model"
    :value="value"
    :disabled="disabled"
    :required="required"
    :name="name"
    :class="[
      'group/checkbox',
      styles.checkbox,
      { [styles.labelStart ?? '']: position === 'start' },
    ]"
  >
    <span :class="[styles.control, classes?.control]">
      <GsIcon size="small">
        <CheckIcon v-if="state === true" />
        <RemoveIcon v-else-if="state === 'indeterminate'" />
      </GsIcon>
    </span>
    <span v-if="$slots.default" :class="[styles.label, classes?.label]"><slot /></span>
  </CheckboxRoot>
</template>
