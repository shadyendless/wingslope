<script setup lang="ts">
/**
 * A labeled date (and optionally time) input made of editable segments. Bind `v-model` to a
 * `DateValue` from `@internationalized/date`, e.g. `parseDate('2026-11-13')`.
 *
 * Each segment is edited by typing or with the arrow keys. Built on Reka UI's `DateFieldRoot`.
 * `class` and `style` apply to the field wrapper; other attributes go to the segment group.
 *
 * @example
 * ```vue
 * <GsDateField v-model="departure" label="Departure" :min-value="today(getLocalTimeZone())" />
 * ```
 */
import type { DateValue } from '@internationalized/date'
import CalendarIcon from '@wingbrace/glideslope-icons/calendar'
import { DateFieldInput, DateFieldRoot } from 'reka-ui'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import GsIcon from '../icon/GsIcon.vue'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { isPlaceholderSegment, isVisibleLiteral, shortMonthName, type Segment } from './segments'
import styles from './styles.module.css'
import type { GsDateFieldProps } from './types'

defineOptions({ inheritAttrs: false })

const {
  label,
  description,
  errorMessage,
  size = 'medium',
  invalid = false,
  disabled = false,
  required = false,
  name,
  validate,
  validationMode,
  granularity = 'day',
  hourCycle,
  minValue,
  maxValue,
  shortMonth = true,
  locale,
  readonly = false,
  classes,
} = defineProps<GsDateFieldProps>()

/** The date, or `null` when empty. */
const model = defineModel<DateValue | null>({ default: null })

const { rootAttrs, controlAttrs } = useSplitAttrs()

function segmentText(segment: Segment) {
  if (segment.part === 'month' && shortMonth && model.value && !isPlaceholderSegment(segment)) {
    return shortMonthName(model.value, locale ?? 'en-US')
  }
  return segment.value
}
</script>

<template>
  <GsFieldLayout
    v-slot="{ ariaLabel }"
    v-bind="rootAttrs"
    :label="label"
    :description="readonly ? undefined : description"
    :error-message="errorMessage"
    :size="size"
    :invalid="invalid"
    :disabled="disabled"
    :required="required"
    :name="name"
    :validate="validate"
    :validation-mode="validationMode"
    :native-label="false"
    :classes="classes"
  >
    <DateFieldRoot
      v-slot="{ segments }"
      v-bind="controlAttrs"
      v-model="model"
      :aria-label="ariaLabel ?? controlAttrs['aria-label']"
      :granularity="granularity"
      :hour-cycle="hourCycle"
      :min-value="minValue"
      :max-value="maxValue"
      :locale="locale"
      :disabled="disabled"
      :readonly="readonly"
      :class="[styles.control, classes?.control]"
    >
      <GsIcon v-if="!readonly && size === 'medium'"><CalendarIcon /></GsIcon>
      <div :class="[styles.input, classes?.input]">
        <template v-for="(segment, index) in segments" :key="`${segment.part}-${index}`">
          <span v-if="isVisibleLiteral(segment)" aria-hidden="true">:</span>
          <DateFieldInput
            v-else-if="segment.part !== 'literal'"
            :part="segment.part"
            :class="[
              styles.segment,
              { [styles.shortMonth ?? '']: segment.part === 'month' && shortMonth },
              classes?.segment,
            ]"
            :data-placeholder="isPlaceholderSegment(segment) ? '' : undefined"
          >
            {{ segmentText(segment) }}
          </DateFieldInput>
        </template>
      </div>
    </DateFieldRoot>
  </GsFieldLayout>
</template>
