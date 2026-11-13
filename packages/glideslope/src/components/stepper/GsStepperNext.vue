<script setup lang="ts">
/**
 * Goes to the next step. Disabled on the last step and when the next step is disabled. A
 * `GsButton`: button props and classes apply.
 */
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import { injectStepperContext } from './context'

const slots = defineSlots<{
  /** Button content. @default 'Next' */
  default?: () => unknown
}>()

const stepper = injectStepperContext('GsStepperNext')
const target = computed(() => {
  const index =
    stepper.current.value === undefined ? -1 : stepper.steps.value.indexOf(stepper.current.value)
  return index === -1 ? undefined : stepper.steps.value[index + 1]
})
const blocked = computed(() => target.value === undefined || stepper.isDisabled(target.value))

function next() {
  if (target.value !== undefined) stepper.goTo(target.value)
}
</script>

<template>
  <GsButton
    :disabled="blocked"
    :aria-label="slots.default ? undefined : 'Go to next step'"
    @click="next"
  >
    <slot>Next</slot>
  </GsButton>
</template>
