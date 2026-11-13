<script setup lang="ts">
/**
 * One step: a button that selects it. Unstyled; style it with classes using `data-current`,
 * `data-visited` and `data-disabled`. Without content it is named "Step 2 of 3".
 */
import { StepperItem, StepperTrigger } from 'reka-ui'
import { computed, onBeforeUnmount, useId, watch } from 'vue'
import { injectStepperContext } from './context'
import type { GsStepperStepProps } from './types'

const { value, disabled = false } = defineProps<GsStepperStepProps>()

const slots = defineSlots<{
  /** Step content, such as a label. */
  default?: () => unknown
}>()

const stepper = injectStepperContext('GsStepperStep')
const id = useId()

let unregister = stepper.register(value, id, () => disabled)
watch(
  () => value,
  (next) => {
    unregister()
    unregister = stepper.register(next, id, () => disabled)
  },
)
onBeforeUnmount(() => unregister())

const position = computed(() => stepper.steps.value.indexOf(value) + 1)
const isCurrent = computed(() => stepper.current.value === value)
const isVisited = computed(() => stepper.completed.value.includes(value))
const isDisabled = computed(() => stepper.isDisabled(value))
</script>

<template>
  <!-- Reka points the trigger at StepperTitle / StepperDescription ids; this stepper doesn't
       render those parts, so the references are cleared and the step keeps its own name. -->
  <StepperItem :step="position" :disabled="isDisabled" :completed="isVisited" as-child>
    <StepperTrigger
      :id="id"
      type="button"
      :disabled="isDisabled"
      :aria-current="isCurrent ? 'step' : undefined"
      :aria-label="slots.default ? undefined : `Step ${position} of ${stepper.steps.value.length}`"
      :aria-labelledby="undefined"
      :aria-describedby="undefined"
      :data-current="isCurrent ? '' : undefined"
      :data-visited="isVisited ? '' : undefined"
      :data-disabled="isDisabled ? '' : undefined"
    >
      <slot />
    </StepperTrigger>
  </StepperItem>
</template>
