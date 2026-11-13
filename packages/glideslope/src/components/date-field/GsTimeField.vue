<script setup lang="ts">
/**
 * A labeled time input made of editable segments. Bind `v-model` to a `Time` from
 * `@internationalized/date`, e.g. `new Time(14, 30)`.
 *
 * Built on Reka UI's `TimeFieldRoot`. `class` and `style` apply to the field wrapper; other
 * attributes go to the segment group.
 *
 * @example
 * ```vue
 * <GsTimeField v-model="eta" label="ETA" :hour-cycle="24" />
 * ```
 */
import type { Time } from '@internationalized/date'
import { TimeFieldInput, TimeFieldRoot } from 'reka-ui'
import GsFieldConnect from '../field/GsFieldConnect.vue'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { isPlaceholderSegment, isVisibleLiteral } from './segments'
import styles from './styles.module.css'
import type { GsTimeFieldProps } from './types'

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
  granularity = 'second',
  hourCycle = 24,
  minValue,
  maxValue,
  locale,
  readonly = false,
  classes,
} = defineProps<GsTimeFieldProps>()

/** The time, or `null` when empty. */
const model = defineModel<Time | null>({ default: null })

const { rootAttrs, controlAttrs } = useSplitAttrs()
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
    <!-- Reka UI's TimeFieldRoot doesn't join FieldRoot by itself (DateFieldRoot does). -->
    <GsFieldConnect v-slot="fieldAttrs" :value="model">
      <TimeFieldRoot
        v-slot="{ segments }"
        v-bind="{ ...fieldAttrs, ...controlAttrs }"
        v-model="model"
        :aria-label="ariaLabel ?? controlAttrs['aria-label']"
        :granularity="granularity"
        :hour-cycle="hourCycle"
        :min-value="minValue"
        :max-value="maxValue"
        :locale="locale"
        :disabled="disabled"
        :readonly="readonly"
        :class="[styles.control, styles.time, classes?.control]"
      >
        <div :class="[styles.input, classes?.input]">
          <template v-for="(segment, index) in segments" :key="`${segment.part}-${index}`">
            <span v-if="isVisibleLiteral(segment)" aria-hidden="true">:</span>
            <TimeFieldInput
              v-else-if="segment.part !== 'literal'"
              :part="segment.part"
              :class="[styles.segment, classes?.segment]"
              :data-placeholder="isPlaceholderSegment(segment) ? '' : undefined"
            >
              {{ segment.value }}
            </TimeFieldInput>
          </template>
        </div>
      </TimeFieldRoot>
    </GsFieldConnect>
  </GsFieldLayout>
</template>
